"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleWrapHandler = void 0;
const types_1 = require("../../types");
const base_1 = require("./base");
const utils_1 = require("../../utils");
/**
 * Generic inline formatter that wraps text with matching opening/closing lexemes. Suitable
 * for things like `**`, `*`, `\``, etc.
 */
class SimpleWrapHandler extends base_1.BaseHandler {
    constructor(handleLex, startTag, endTag) {
        super();
        this.lastLex = "";
        this.lastLexEscaped = false;
        this.inTag = false;
        this.closed = false;
        this.handleLex = handleLex;
        this.startTag = startTag;
        this.endTag = endTag;
    }
    getName() {
        return `simple-wrap-${this.handleLex}`;
    }
    canAccept(lexeme) {
        return this.handleLex == lexeme;
    }
    nextAction(lexeme) {
        if (this.closed) {
            return types_1.InlineActions.REJECT;
        }
        if (this.inTag && (lexeme[0] == "\\" || this.handleLex == lexeme)) {
            return types_1.InlineActions.CONTINUE;
        }
        return types_1.InlineActions.DEFER;
    }
    isEnclosingLex(lexeme, def) {
        return lexeme == this.handleLex && !this.lastLexEscaped;
    }
    /**
     * If the enclosing tag is encountered (and not escaped), defer control to this method.
     * This is used to signal opening and closing of tag
     * @param lexeme
     * @param def
     * @protected
     */
    handleEnclosingLex(lexeme, def) {
        if (this.closed) {
            return types_1.InlineActions.REJECT;
        }
        if (this.inTag) {
            this.inTag = false;
            this.closed = true;
            return types_1.InlineActions.POP;
        }
        this.inTag = true;
        return types_1.InlineActions.NEST;
    }
    /**
     * If enclosing tag is not encountered but we're inTag, defer control to this method.
     * @param lexeme
     * @param def
     * @protected
     */
    handlePush(lexeme, def) {
        this.words.push(utils_1.returnUnescapedString(lexeme));
        return types_1.InlineActions.CONTINUE;
    }
    /**
     * If enclosing tag is not encountered but we're closed, defer control to this method.
     * Note that this is the least likely method to override.
     * @param lexeme
     * @param def
     * @protected
     */
    handleClose(lexeme, def) {
        return types_1.InlineActions.REJECT;
    }
    push(lexeme, def) {
        let ret = types_1.InlineActions.REJECT;
        if (this.isEnclosingLex(lexeme, def)) {
            ret = this.handleEnclosingLex(lexeme, def);
        }
        else if (this.inTag) {
            if (lexeme == "\\") {
                ret = types_1.InlineActions.CONTINUE;
            }
            else {
                ret = this.handlePush(lexeme, def);
            }
        }
        else if (this.closed) {
            ret = this.handleClose(lexeme, def);
        }
        this.lastLexEscaped = lexeme == "\\";
        this.lastLex = lexeme;
        return ret;
    }
    toString() {
        return `${this.startTag}${this.words.join("")}${this.endTag}`;
    }
    cloneInstance() {
        return new SimpleWrapHandler(this.handleLex, this.startTag, this.endTag);
    }
}
exports.SimpleWrapHandler = SimpleWrapHandler;
