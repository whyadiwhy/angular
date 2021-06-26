/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib from 'tslib';

import {createBenchmark} from '../micro_bench';

const promises: Promise<number>[] = [];
for (let i = 0; i < 1_000; i++) {
  promises.push(Promise.resolve(i));
}

async function zoneRunner(gen: Iterator<any, any, any>) {
  let value: any;
  let res: any;
  do {
    // If this throws it should escape the runner
    res = gen.next(value);

    try {
      value = await res.value;
    } catch (e) {
      // If this throws it should escape the runner
      res = gen.throw !(e);
    }
  } while (!res.done);
  return value;
}

async function zoneRunnerWrapper(ctx: any, gen: () => Iterator<any, any, any>) {
  return zoneRunner(gen.call(ctx));
}

// ----------------------------------------------------------------------------
// Deeply recursive
// ----------------------------------------------------------------------------

const recursiveTest = (async () => {
  async function nativeAsyncAwait(n: number): Promise<number> {
    if (n === 0) {
      return 1;
    }
    const index = await promises[n];
    return nativeAsyncAwait(index - 1);
  }

  function*
      proposedGenerativeAsync(n: number):
          Iterator<Promise<number>, number|Promise<number>, number> {
    if (n === 0) {
      return 1;
    }
    const index = yield promises[n];
    return zoneRunner(proposedGenerativeAsync(index - 1));
  }

  function proposedGenerativeAsyncInside(this: any, n: number): any {
    return zoneRunnerWrapper(
        this, function*(): Iterator<Promise<number>, number|Promise<number>, number> {
          if (n === 0) {
            return 1;
          }
          const index = yield promises[n];
          return proposedGenerativeAsyncInside(index - 1);
        });
  }

  function*
      __proposedGenerativeAsyncContained(n: number):
          Iterator<Promise<number>, number|Promise<number>, number> {
    if (n === 0) {
      return 1;
    }
    const index = yield promises[n];
    return proposedGenerativeAsyncContained(index - 1);
  }

  function proposedGenerativeAsyncContained(this: any, n: number): Promise<number> {
    return zoneRunner(__proposedGenerativeAsyncContained.apply(this, arguments as any));
  }

  function tslibEs2015EmulatedGenerator(this: any, n: number) {
    return tslib.__awaiter(
        this, void 0, void 0 as any,
        function*(this: any): Iterator<Promise<number>, number|Promise<number>, number> {
          if (n === 0) {
            return 1;
          }
          const index = yield promises[n];
          return tslibEs2015EmulatedGenerator(index - 1);
        });
  }

  function tslibEs5EmulatedGenerator(this: any, n: number) {
    return tslib.__awaiter(this, void 0, void 0 as any, function(this: any) {
      var index;
      return tslib.__generator(this, function(_a: any) {
        switch (_a.label) {
          case 0:
            if (n === 0) {
              return [2 /*return*/, 1];
            }
            return [4 /*yield*/, promises[n]];
          case 1:
            index = _a.sent();
            return [2 /*return*/, tslibEs5EmulatedGenerator(index - 1)];
        }
      });
    });
  }

  const benchmark = createBenchmark('recursive');
  const nativeAsyncAwaitTime = benchmark('nativeAsyncAwait');
  const proposedGeneratorRunnerTime = benchmark('proposedGeneratorRunner');
  const proposedGeneratorRunnerTimeInside = benchmark('proposedGeneratorRunnerInside');
  const proposedGeneratorRunnerTimeContained = benchmark('proposedGeneratorRunnerContained');
  const tslibEs2015EmulatedGeneratorTime = benchmark('tslibEs2015EmulatedGenerator');
  const tslibEs5EmulatedGeneratorTime = benchmark('tslibEs5EmulatedGenerator');

  while (nativeAsyncAwaitTime()) {
    await nativeAsyncAwait(promises.length - 1);
  }

  while (proposedGeneratorRunnerTime()) {
    await zoneRunner(proposedGenerativeAsync(promises.length - 1));
  }

  while (proposedGeneratorRunnerTimeInside()) {
    await proposedGenerativeAsyncInside(promises.length - 1);
  }

  while (proposedGeneratorRunnerTimeContained()) {
    await proposedGenerativeAsyncContained(promises.length - 1);
  }

  while (tslibEs2015EmulatedGeneratorTime()) {
    await tslibEs2015EmulatedGenerator(promises.length - 1);
  }

  while (tslibEs5EmulatedGeneratorTime()) {
    await tslibEs5EmulatedGenerator(promises.length - 1);
  }

  benchmark.report();
  console.log('-'.repeat(80));
})();


// ----------------------------------------------------------------------------
// Iterative test
// ----------------------------------------------------------------------------

const iterativeTest = (async () => {
  await recursiveTest;

  async function nativeAsyncAwait(n: number): Promise<number> {
    while (n !== 0) {
      const index = await promises[n];
      n = index - 1;
    }
    return n;
  }

  function* proposedGenerativeAsync(n: number): Iterator<Promise<number>, number, number> {
    while (n !== 0) {
      const index = yield promises[n];
      n = index - 1;
    }
    return n;
  }

  function proposedGenerativeAsyncInside(this: any, n: number): any {
    return zoneRunnerWrapper(this, function*(): Iterator<Promise<number>, number, number> {
      while (n !== 0) {
        const index = yield promises[n];
        n = index - 1;
      }
      return n;
    });
  }

  function proposedGenerativeAsyncContained(this: any, n: number): Promise<number> {
    return zoneRunner(proposedGenerativeAsync.apply(this, arguments as any));
  }

  function tslibEs2015EmulatedGenerator(this: any, n: number) {
    return tslib.__awaiter(
        this, void 0, void 0 as any,
        function*(this: any): Iterator<Promise<number>, number, number> {
          while (n !== 0) {
            const index = yield promises[n];
            n = index - 1;
          }
          return n;
        });
  }

  function tslibEs5EmulatedGenerator(this: any, n: number) {
    return tslib.__awaiter(this, void 0, void 0 as any, function(this: any) {
      var index;
      return tslib.__generator(this, function(_a: any) {
        switch (_a.label) {
          case 0:
            if (!(n !== 0)) return [3 /*break*/, 2];
            return [4 /*yield*/, promises[n]];
          case 1:
            index = _a.sent();
            n = index - 1;
            return [3 /*break*/, 0];
          case 2:
            return [2 /*return*/, n];
        }
      });
    });
  }

  const benchmark = createBenchmark('iterative');
  const nativeAsyncAwaitTime = benchmark('nativeAsyncAwait');
  const proposedGeneratorRunnerTime = benchmark('proposedGeneratorRunner');
  const proposedGeneratorRunnerTimeInside = benchmark('proposedGeneratorRunnerInside');
  const proposedGeneratorRunnerTimeContained = benchmark('proposedGeneratorRunnerContained');
  const tslibEs2015EmulatedGeneratorTime = benchmark('tslibEs2015EmulatedGenerator');
  const tslibEs5EmulatedGeneratorTime = benchmark('tslibEs5EmulatedGenerator');

  while (nativeAsyncAwaitTime()) {
    await nativeAsyncAwait(promises.length - 1);
  }

  while (proposedGeneratorRunnerTime()) {
    await zoneRunner(proposedGenerativeAsync(promises.length - 1));
  }

  while (proposedGeneratorRunnerTimeInside()) {
    await proposedGenerativeAsyncInside(promises.length - 1);
  }

  while (proposedGeneratorRunnerTimeContained()) {
    await proposedGenerativeAsyncContained(promises.length - 1);
  }

  while (tslibEs2015EmulatedGeneratorTime()) {
    await tslibEs2015EmulatedGenerator(promises.length - 1);
  }

  while (tslibEs5EmulatedGeneratorTime()) {
    await tslibEs5EmulatedGenerator(promises.length - 1);
  }

  benchmark.report();
  console.log('-'.repeat(80));
})();

// ----------------------------------------------------------------------------
// Single await point
// ----------------------------------------------------------------------------

(async () => {
  await iterativeTest;

  async function nativeAsyncAwait(n: number): Promise<number> {
    const index = await promises[n];
    return index + 1;
  }

  function* proposedGenerativeAsync(n: number): Iterator<Promise<number>, number, number> {
    const index = yield promises[n];
    return index + 1;
  }

  function proposedGenerativeAsyncInside(this: any, n: number): any {
    return zoneRunnerWrapper(this, function*(): Iterator<Promise<number>, number, number> {
      const index = yield promises[n];
      return index + 1;
    });
  }

  function proposedGenerativeAsyncContained(this: any, n: number): Promise<number> {
    return zoneRunner(proposedGenerativeAsync.apply(this, arguments as any));
  }

  function tslibEs2015EmulatedGenerator(this: any, n: number) {
    return tslib.__awaiter(
        this, void 0, void 0 as any,
        function*(this: any): Iterator<Promise<number>, number, number> {
          const index = yield promises[n];
          return index + 1;
        });
  }

  function tslibEs5EmulatedGenerator(this: any, n: number) {
    return tslib.__awaiter(this, void 0, void 0 as any, function(this: any) {
      var index;
      return tslib.__generator(this, function(_a: any) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, promises[n]];
          case 1:
            index = _a.sent();
            return [2 /*return*/, index + 1];
        }
      });
    });
  }

  const benchmark = createBenchmark('once');
  const nativeAsyncAwaitTime = benchmark('nativeAsyncAwait');
  const proposedGeneratorRunnerTime = benchmark('proposedGeneratorRunner');
  const proposedGeneratorRunnerTimeInside = benchmark('proposedGeneratorRunnerInside');
  const proposedGeneratorRunnerTimeContained = benchmark('proposedGeneratorRunnerContained');
  const tslibEs2015EmulatedGeneratorTime = benchmark('tslibEs2015EmulatedGenerator');
  const tslibEs5EmulatedGeneratorTime = benchmark('tslibEs5EmulatedGenerator');

  while (nativeAsyncAwaitTime()) {
    await nativeAsyncAwait(promises.length - 1);
  }

  while (proposedGeneratorRunnerTime()) {
    await zoneRunner(proposedGenerativeAsync(promises.length - 1));
  }

  while (proposedGeneratorRunnerTimeInside()) {
    await proposedGenerativeAsyncInside(promises.length - 1);
  }

  while (proposedGeneratorRunnerTimeContained()) {
    await proposedGenerativeAsyncContained(promises.length - 1);
  }

  while (tslibEs2015EmulatedGeneratorTime()) {
    await tslibEs2015EmulatedGenerator(promises.length - 1);
  }

  while (tslibEs5EmulatedGeneratorTime()) {
    await tslibEs5EmulatedGenerator(promises.length - 1);
  }

  benchmark.report();
  console.log('-'.repeat(80));
})();
