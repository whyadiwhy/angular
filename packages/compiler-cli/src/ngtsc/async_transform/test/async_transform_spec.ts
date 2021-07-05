/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom, getFileSystem} from '../../file_system';
import {MockFileSystem, runInEachFileSystem} from '../../file_system/testing';
import {loadStandardTestFiles, makeProgram} from '../../testing';
import {createAsyncTransform} from '../src/async_transform';

runInEachFileSystem(() => {
  describe('async transform', () => {
    let _: typeof absoluteFrom;

    beforeEach(() => {
      _ = absoluteFrom;
      const libs = loadStandardTestFiles({fakeCore: false});
      const fs = getFileSystem() as MockFileSystem;
      fs.init(libs);
    });

    it('should ignore code that does not contain `async` keyword', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: `
        export function foo(): Promise<number> {
          return new Promise<number>(resolve => { return 100; });
        }
      `
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'export function foo() {',
        '    return new Promise(resolve => { return 100; });',
        '}',
        '',
      ]);
    });

    it('should transform a simple async function expression to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'export const foo = async function foo() {',
          '  return 100;',
          '};',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'export const foo = function foo() {',
        '    return Zone.__awaiter(this, [], function* foo_generator_1() {',
        '        return 100;',
        '    });',
        '};',
        '',
      ]);
    });

    it('should transform a simple async function declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'async function foo() {',
          '  return 100;',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'function foo() {',
        '    return Zone.__awaiter(this, [], function* foo_generator_1() {',
        '        return 100;',
        '    });',
        '}',
        '',
      ]);
    });

    it('should transform a simple async arrow function to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'const foo = async () => 100;',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'const foo = () => Zone.__awaiter(this, [], function* anonymous_generator_1() { return 100; });',
        '',
      ]);
    });

    it('should transform a simple async method to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Test {',
          '  async foo() {',
          '    return 100;',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'class Test {',
        '    foo() {',
        '        return Zone.__awaiter(this, [], function* foo_generator_1() {',
        '            return 100;',
        '        });',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform an async-await function expression to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'export const foo = async function foo(a: number, b: string): Promise<number> {',
          '  const x = await a;',
          '  if (x) {',
          '    await 200;',
          '  }',
          '  return await 300;',
          '};',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'export const foo = function foo(a, b) {',
        '    return Zone.__awaiter(this, [], function* foo_generator_1() {',
        '        const x = yield a;',
        '        if (x) {',
        '            yield 200;',
        '        }',
        '        return yield 300;',
        '    });',
        '};',
        '',
      ]);
    });

    it('should transform an async-await function declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'export async function foo(a: number, b: string): Promise<number> {',
          '  const x = await a;',
          '  if (x) {',
          '    await 200;',
          '  }',
          '  return await 300;',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'export function foo(a, b) {',
        '    return Zone.__awaiter(this, [], function* foo_generator_1() {',
        '        const x = yield a;',
        '        if (x) {',
        '            yield 200;',
        '        }',
        '        return yield 300;',
        '    });',
        '}',
        '',
      ]);
    });

    it('should transform an async-await arrow function to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'const foo: (a: number, b: string) => Promise<number> = async (a: number, b: string) => {',
          '  const x = await a;',
          '  if (x) {',
          '    await 200;',
          '  }',
          '  return await 300;',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'const foo = (a, b) => Zone.__awaiter(this, [], function* anonymous_generator_1() {',
        '    const x = yield a;',
        '    if (x) {',
        '        yield 200;',
        '    }',
        '    return yield 300;',
        '});',
        '',
      ]);
    });

    it('should transform an async-await method declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'class Test {',
          '  async foo(a: number, b: string): Promise<number> {',
          '    const x = await a;',
          '    if (x) {',
          '      await 200;',
          '    }',
          '    return await 300;',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      expect(emittedContent.split(/\r?\n/g)).toEqual([
        'class Test {',
        '    foo(a, b) {',
        '        return Zone.__awaiter(this, [], function* foo_generator_1() {',
        '            const x = yield a;',
        '            if (x) {',
        '                yield 200;',
        '            }',
        '            return yield 300;',
        '        });',
        '    }',
        '}',
        '',
      ]);
    });

    it('should transform a decorated async method declaration to a generator', () => {
      const testFile = {
        name: _('/test.ts'),
        contents: [
          'const Input: any = {};',
          'class Test {',
          '  @Input',
          '  async foo(a: number, b: string): Promise<number> {',
          '    return await 300;',
          '  }',
          '}',
        ].join('\n')
      };
      const emittedContent = emitProgram(testFile);
      // Strip out the decorator helper code
      const cleanedContent = emittedContent.replace(/^[\s\S]*const Input/, 'const Input');
      expect(cleanedContent.split(/\r?\n/g)).toEqual([
        'const Input = {};',
        'class Test {',
        '    foo(a, b) {',
        '        return Zone.__awaiter(this, [], function* foo_generator_1() {',
        '            return yield 300;',
        '        });',
        '    }',
        '}',
        '__decorate([',
        '    Input',
        '], Test.prototype, "foo", null);',
        '',
      ]);
    });
  });

  function emitProgram(testFile: Parameters<typeof makeProgram>[0][0]): string {
    // `makeProgram()` defaults `noLib` to true but we need it to allow use to use `Promise`.
    const {program, host} = makeProgram([testFile], {noLib: false, target: ts.ScriptTarget.ES2018});
    program.emit(undefined, undefined, undefined, undefined, {before: [createAsyncTransform()]});
    return host.readFile(testFile.name.replace(/\.ts$/, '.js'))!;
  }
});
