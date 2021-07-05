/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Call this function to create a factory for a TS transformer that can convert async-await code
 * into code that is compatible with Zone.js.
 *
 * There is no way for Zone.js to hook into the promises that are created by native use of `async`
 * functions. This can cause the tasks created by such promises to be ignored by Zone.js and in
 * Angular, cause missed changed detection notifications.
 *
 * This transform converts all `async` functions in a source file into a generator function that is
 * iterated over by the `Zone.__awaiter()` helper function.
 * Each `await` point in the `async` function is converted to a `yield` in the generator.
 * The helper function then ensures that each yield point is correctly handled within the correct
 * zone.
 *
 * @returns a TS transformer factory function that returns the TS transformer.
 */
export function createAsyncTransform(): ts.TransformerFactory<ts.SourceFile> {
  // The transformer factory function.
  return (context) => {
    const visitor = new AsyncFunctionVisitor(context);

    // The transformer function.
    return (sourceFile) => {
      if (!sourceFile.text.includes('async')) {
        // Do not waste time with visiting the AST if there is no `async` string in the file.
        return sourceFile;
      }
      return ts.visitNode(sourceFile, visitor.visit);
    };
  };
}

/**
 * This class implements a TypeScript visitor function to transform async functions into Zone safe
 * wrapped generator functions.
 */
class AsyncFunctionVisitor {
  private readonly factory = this.context.factory;

  constructor(private readonly context: ts.TransformationContext) {}

  /**
   * The visitor function that is passed to TypeScript's `visitNode` in the transformer above.
   *
   * Note that this must be defined as an arrow function property for it to hold on to its `this`
   * value correctly when called as a free-standing function.
   */
  visit: ts.Visitor = node => {
    node = ts.visitEachChild(node, this.visit, this.context);

    if (isAsyncFunction(node)) {
      // Convert async functions to generators wrapped in `Zone.__awaiter()` calls.
      node = this.transformAsyncFunction(node);
    }

    if (ts.isAwaitExpression(node)) {
      // Convert `await` to `yield`.
      node = this.factory.createYieldExpression(undefined, node.expression);
    }

    return node;
  };

  /**
   * Transform the identified async function into a generator function that is wrapped in a call to
   * the `Zone.__awaiter()` helper.
   *
   * The async function is replaced with an updated function, which runs a generator function inside
   * a call to the `Zone.__awaiter()` helper function.
   * We must use a specific TypeScript factory function for each type of function that can be
   * transformed.
   */
  private transformAsyncFunction(asyncFn: ts.SignatureDeclaration): ts.Node {
    const modifiers = filterAsyncModifier(asyncFn.modifiers);
    const awaiterCall = this.createAwaiterCall(asyncFn);

    if (ts.isArrowFunction(asyncFn)) {
      return this.factory.updateArrowFunction(
          asyncFn, undefined, asyncFn.typeParameters, asyncFn.parameters, asyncFn.type,
          this.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), awaiterCall);
    }

    const awaiterCallStatement = this.factory.createReturnStatement(awaiterCall);
    const body = this.factory.createBlock([awaiterCallStatement], true);

    if (ts.isFunctionExpression(asyncFn)) {
      return this.factory.updateFunctionExpression(
          asyncFn, modifiers, undefined, asyncFn.name, asyncFn.typeParameters, asyncFn.parameters,
          asyncFn.type, body);
    }

    if (ts.isFunctionDeclaration(asyncFn)) {
      return this.factory.updateFunctionDeclaration(
          asyncFn, asyncFn.decorators, modifiers, undefined, asyncFn.name, asyncFn.typeParameters,
          asyncFn.parameters, asyncFn.type, body);
    }

    if (ts.isMethodDeclaration(asyncFn)) {
      return this.factory.updateMethodDeclaration(
          asyncFn, asyncFn.decorators, modifiers, undefined, asyncFn.name, asyncFn.questionToken,
          asyncFn.typeParameters, asyncFn.parameters, asyncFn.type, body);
    }

    throw new Error('Unsupported async function type');
  }

  /**
   * Create a call to the `Zone.__awaiter()` function, which passes in the new generator function as
   * one of its parameters.
   */
  private createAwaiterCall(asyncFn: ts.SignatureDeclaration): ts.CallExpression {
    const globalZone = this.factory.createIdentifier('Zone');
    const awaiterFn = this.factory.createPropertyAccessExpression(globalZone, '__awaiter');
    const awaiterArgs: readonly ts.Expression[] = [
      this.factory.createThis(),
      this.factory.createArrayLiteralExpression([]),
      this.createGeneratorFunction(asyncFn),
    ];
    return this.factory.createCallExpression(awaiterFn, undefined, awaiterArgs);
  }

  /**
   * Create the generator function that will replace the async function.
   */
  private createGeneratorFunction(asyncFn: ts.SignatureDeclaration): ts.FunctionExpression {
    const star = this.factory.createToken(ts.SyntaxKind.AsteriskToken);
    const generatorName = this.computeGeneratorName(asyncFn);
    const generatorBody = this.createGeneratorBody(asyncFn);
    const generatorFn = this.factory.createFunctionExpression(
        undefined, star, generatorName, undefined, undefined, undefined, generatorBody);
    return generatorFn;
  }

  /**
   * Compute a unique name for the new generator function.
   *
   * The name is computed from the name of the `async` function if this is available.
   */
  private computeGeneratorName(asyncFn: ts.SignatureDeclaration): ts.Identifier {
    if (asyncFn.name !== undefined && ts.isIdentifier(asyncFn.name)) {
      return this.factory.createUniqueName(asyncFn.name.text + '_generator');
    } else {
      return this.factory.createUniqueName('anonymous_generator');
    }
  }

  /**
   * Create a body block to be used in the generator function that will replace an async function.
   *
   * In most cases we can just take the body of the async function, but arrow functions need special
   * consideration, since they may have an expression rather than a function body block.
   *
   * See `convertConciseBodyToFunctionBody()` for an example.
   */
  private createGeneratorBody(asyncFn: ts.SignatureDeclaration): ts.FunctionBody {
    const generatorBody = ts.isArrowFunction(asyncFn) ?
        this.convertConciseBodyToFunctionBody(asyncFn.body) :
        hasFunctionBody(asyncFn) ? asyncFn.body : null;
    if (generatorBody == null) {
      throw new Error('Unexpected lack of body for async function.');
    }
    return generatorBody;
  }

  /**
   * Convert the "body" of an arrow function into a full function body that can be used in a
   * generator function.
   *
   * Generator functions cannot be arrow functions, and so cannot have a simple expression for their
   * body.
   *
   * For example:
   *
   * ```ts
   * const foo => 100;
   * ```
   *
   * would be converted to:
   *
   * ```ts
   * const foo = function* () { return 100; };
   * ```
   */
  private convertConciseBodyToFunctionBody(body: ts.ConciseBody): ts.FunctionBody {
    return ts.isBlock(body) ? body :
                              this.factory.createBlock([this.factory.createReturnStatement(body)]);
  }
}

//// HELPERS

/**
 * Test to see if the given `node` is an async function (declaration, expression or method).
 */
function isAsyncFunction(node: ts.Node): node is ts.FunctionExpression|ts.FunctionDeclaration|
    ts.MethodDeclaration {
  return (ts.isArrowFunction(node) || ts.isFunctionExpression(node) ||
          ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
      !!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Async);
}

/**
 * Return a clone of the given `modifiers` with the `async` modifier filtered out.
 */
function filterAsyncModifier(modifiers: ts.ModifiersArray|undefined): ts.Modifier[]|undefined {
  if (modifiers === undefined) {
    return undefined;
  }
  return modifiers.filter(modifier => modifier.kind !== ts.SyntaxKind.AsyncKeyword);
}

/**
 * Test to see if the given `fn` signature declaration has a defined function body.
 */
function hasFunctionBody(fn: ts.SignatureDeclaration): fn is ts.SignatureDeclaration&
    {body: ts.FunctionBody} {
  return ts.isFunctionExpression(fn) || ts.isFunctionDeclaration(fn) ||
      ts.isMethodDeclaration(fn) && fn.body !== undefined;
}
