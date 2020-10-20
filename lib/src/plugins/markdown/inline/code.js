"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeHandler = void 0;
const simple_wrap_1 = require("../../../inline/handlers/simple-wrap");
const types_1 = require("../../../types");
class CodeHandler extends simple_wrap_1.SimpleWrapHandler {
    constructor() {
        super("`", "<code>", "</code>");
    }
    nextAction(lexeme) {
        const nextAction = super.nextAction(lexeme);
        return nextAction == types_1.InlineActions.DEFER
            ? types_1.InlineActions.CONTINUE
            : nextAction;
    }
    cloneInstance() {
        return new CodeHandler();
    }
}
exports.CodeHandler = CodeHandler;
