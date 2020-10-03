"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserContext = void 0;
/**
 * @deprecated
 */
class ParserContext {
    constructor() {
        this.vars = {};
    }
    push(lex, def) {
        if (!this.cur) {
            throw new Error("no current handler set");
        }
        return this.cur.push(lex, def);
    }
    getCurrentHandler() {
        return this.cur;
    }
    setCurrentHandler(handler) {
        this.cur = handler;
    }
}
exports.ParserContext = ParserContext;
