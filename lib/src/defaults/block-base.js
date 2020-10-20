"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockEmptyHandler = exports.BlockBase = void 0;
const types_1 = require("../types");
class BlockBase {
    constructor() {
        this.inlineFormatter = types_1.InlineFormatterDummy;
    }
    setContext(context) {
        this.context = context;
        this.inlineFormatter = context.getInlineFormatter();
    }
}
exports.BlockBase = BlockBase;
class BlockEmptyHandler extends BlockBase {
    getName() {
        throw new Error("getName() not defined");
    }
    canAccept(lexeme, def) {
        throw new Error("canAccept() not defined");
    }
    push(lexeme, def) {
        throw new Error("push() not defined");
    }
    cloneInstance() {
        throw new Error("cloneInstance() not defined");
    }
    toString() {
        throw new Error("toString() not defined");
    }
}
exports.BlockEmptyHandler = BlockEmptyHandler;
