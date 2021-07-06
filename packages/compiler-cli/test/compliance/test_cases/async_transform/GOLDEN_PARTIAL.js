/****************************************************************************************************
 * PARTIAL FILE: async_functions_transformed.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function Input() { }
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
export const fnArrowBlock = (a, b) => Zone.__awaiter(this, [], function* anonymous_generator_1() {
    const x = yield a;
    if (x > 10) {
        return yield 200;
    }
    return yield b;
});
export const fnArrowExpression = (a, b) => Zone.__awaiter(this, [], function* anonymous_generator_2() { return (yield a) > 10 ? yield 200 : yield b; });
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
        this.methodArrowBlock = (a, b) => Zone.__awaiter(this, [], function* anonymous_generator_3() {
            const x = yield a;
            if (x > 10) {
                return yield 200;
            }
            return yield b;
        });
        this.methodArrowExpression = (a, b) => Zone.__awaiter(this, [], function* anonymous_generator_4() { return (yield a) > 10 ? yield 200 : yield b; });
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
__decorate([
    Input(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Promise]),
    __metadata("design:returntype", Promise)
], Test.prototype, "methodDeclaration", null);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodExpression", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowBlock", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowExpression", void 0);

/****************************************************************************************************
 * PARTIAL FILE: async_functions_transformed.d.ts
 ****************************************************************************************************/
export declare function fnDeclaration(a: number, b: Promise<string>): Promise<number | string>;
export declare const fnExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare class Test {
    static staticMethodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    methodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    protected methodExpression: (a: number, b: Promise<string>) => Promise<number | string>;
    readonly methodArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
    methodArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
}

/****************************************************************************************************
 * PARTIAL FILE: async_functions_plain.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function Input() { }
export async function fnDeclaration(a, b) {
    const x = await a;
    if (x > 10) {
        return await 200;
    }
    return await b;
}
export const fnExpression = async function fnExpression(a, b) {
    const x = await a;
    if (x > 10) {
        return await 200;
    }
    return await b;
};
export const fnArrowBlock = async (a, b) => {
    const x = await a;
    if (x > 10) {
        return await 200;
    }
    return await b;
};
export const fnArrowExpression = async (a, b) => await a > 10 ? await 200 : await b;
export class Test {
    constructor() {
        this.methodExpression = async function methodExpression(a, b) {
            const x = await a;
            if (x > 10) {
                return await 200;
            }
            return await b;
        };
        this.methodArrowBlock = async (a, b) => {
            const x = await a;
            if (x > 10) {
                return await 200;
            }
            return await b;
        };
        this.methodArrowExpression = async (a, b) => await a > 10 ? await 200 : await b;
    }
    static async staticMethodDeclaration(a, b) {
        const x = await a;
        if (x > 10) {
            return await 200;
        }
        return await b;
    }
    async methodDeclaration(a, b) {
        const x = await a;
        if (x > 10) {
            return await 200;
        }
        return await b;
    }
}
__decorate([
    Input(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Promise]),
    __metadata("design:returntype", Promise)
], Test.prototype, "methodDeclaration", null);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodExpression", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowBlock", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowExpression", void 0);

/****************************************************************************************************
 * PARTIAL FILE: async_functions_plain.d.ts
 ****************************************************************************************************/
export declare function fnDeclaration(a: number, b: Promise<string>): Promise<number | string>;
export declare const fnExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare class Test {
    static staticMethodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    methodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    protected methodExpression: (a: number, b: Promise<string>) => Promise<number | string>;
    readonly methodArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
    methodArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
}

