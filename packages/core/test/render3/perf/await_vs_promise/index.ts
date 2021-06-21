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
for (let i = 0; i < 10_000; i++) {
  promises.push(Promise.resolve(i));
}

async function nativeAsyncAwait(n: number): Promise<number> {
  if (n === 0) {
    return 1;
  }
  const index = await promises[n];
  const nextIndex = await nativeAsyncAwait(index - 1);
  return nextIndex;
}

function* proposedGenerativeAsync(n: number): Iterator<Promise<number>, number, number> {
  if (n === 0) {
    return 1;
  }
  const index = yield promises[n];
  const nextIndex = yield zoneRunner(proposedGenerativeAsync(index - 1));
  return nextIndex;
}

async function zoneRunner(gen: Iterator<any, any, any>) {
  let res = gen.next();
  // let zone = Zone.current;
  let value = await res.value;
  while (!res.done) {
    // res = zone.run(gen.next, gen, [value]);
    res = gen.next(value);
    value = await res.value;
  }
  return value;
}

function tslibEmulatedGenerator(this: any, n: number) {
  return tslib.__awaiter(this, void 0, void 0 as any, function(this: any) {
    var index, nextIndex;
    return tslib.__generator(this, function(_a: any) {
      switch (_a.label) {
        case 0:
          if (n === 0) {
            return [2 /*return*/, 1];
          }
          return [4 /*yield*/, promises[n]];
        case 1:
          index = _a.sent();
          return [4 /*yield*/, tslibEmulatedGenerator(index - 1)];
        case 2:
          nextIndex = _a.sent();
          return [2 /*return*/, nextIndex];
      }
    });
  });
}

const benchmarkRefresh = createBenchmark('async');
const nativeAsyncAwaitTime = benchmarkRefresh('nativeAsyncAwait');
const proposedGeneratorRunnerTime = benchmarkRefresh('proposedGeneratorRunner');
const tslibEmulatedGeneratorTime = benchmarkRefresh('tslibEmulatedGenerator');

(async () => {
  while (nativeAsyncAwaitTime()) {
    await nativeAsyncAwait(promises.length - 1);
  }

  while (proposedGeneratorRunnerTime()) {
    await zoneRunner(proposedGenerativeAsync(promises.length - 1));
  }

  while (tslibEmulatedGeneratorTime()) {
    await tslibEmulatedGenerator(promises.length - 1);
  }

  benchmarkRefresh.report();
})();
