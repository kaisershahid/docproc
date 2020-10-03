"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockBase = void 0;
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
