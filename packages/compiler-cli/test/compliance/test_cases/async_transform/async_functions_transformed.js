function Input() {}

export function fnDeclaration(a, b) {
  return Zone.__awaiter(this, [], function* fnDeclaration_generator_1() {
    const x = yield a;
    if (x > 10) {
      return yield 200;
    }
    return yield b;
  });
}

export const fnExpression = function fnExpression(a, b) {
  return Zone.__awaiter(this, [], function* fnExpression_generator_1() {
    const x = yield a;
    if (x > 10) {
      return yield 200;
    }
    return yield b;
  });
};

export const fnArrowBlock = (a, b) =>
  Zone.__awaiter(this, [], function* anonymous_generator_1() {
    const x = yield a;
    if (x > 10) {
      return yield 200;
    }
    return yield b;
  });

export const fnArrowExpression = (a, b) =>
  Zone.__awaiter(this, [], function* anonymous_generator_2() {
    return (yield a) > 10 ? yield 200 : yield b;
  });

export class Test {
  constructor() {
    this.methodExpression = function methodExpression(a, b) {
      return Zone.__awaiter(this, [], function* methodExpression_generator_1() {
        const x = yield a;
        if (x > 10) {
          return yield 200;
        }
        return yield b;
      });
    };

    this.methodArrowBlock = (a, b) =>
      Zone.__awaiter(this, [], function* anonymous_generator_3() {
        const x = yield a;
        if (x > 10) {
          return yield 200;
        }
        return yield b;
      });

    this.methodArrowExpression = (a, b) =>
      Zone.__awaiter(this, [], function* anonymous_generator_4() {
        return (yield a) > 10? yield 200: yield b;
      });
  }

  static staticMethodDeclaration(a, b) {
    return Zone.__awaiter(this, [], function* staticMethodDeclaration_generator_1() {
      const x = yield a;
      if (x > 10) {
        return yield 200;
      }
      return yield b;
    });
  }

  methodDeclaration(a, b) {
    return Zone.__awaiter(this, [], function* methodDeclaration_generator_1() {
      const x = yield a;
      if (x > 10) {
        return yield 200;
      }
      return yield b;
    });
  }
}
