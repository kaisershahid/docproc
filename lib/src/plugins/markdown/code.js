"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeIndentedHandler = exports.CodeHandler = exports.CodeState = void 0;
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const block_base_1 = require("../../defaults/block-base");
const escape_html_1 = require("../../utils_/escape-html");
const lexdef_lookaheads_1 = require("./lexdef.lookaheads");
var CodeState;
(function (CodeState) {
    CodeState[CodeState["start"] = 0] = "start";
    CodeState[CodeState["langtype"] = 1] = "langtype";
    CodeState[CodeState["in_code"] = 2] = "in_code";
    CodeState[CodeState["end"] = 3] = "end";
})(CodeState = exports.CodeState || (exports.CodeState = {}));
/**
 * Handle multiline <pre/>.
 */
class CodeHandler extends block_base_1.BlockBase {
    constructor() {
        super(...arguments);
        this.state = CodeState.start;
        this.codeType = "";
        this.lastLex = "";
        this.lastLexEsc = false;
        this.buff = "";
        this.lines = [];
    }
    pushLine() {
        this.lines.push(this.buff);
        this.buff = "";
    }
    getName() {
        return "code";
    }
    canAccept(lexeme, def) {
        return lexeme == "```";
    }
    push(lexeme, def) {
        let ret = types_1.BlockActions.REJECT;
        if (this.state == CodeState.start) {
            ret = this.handleStart(lexeme, def);
        }
        else if (this.state == CodeState.langtype) {
            ret = this.handleLangtype(lexeme, def);
        }
        else if (this.state == CodeState.in_code) {
            ret = this.handleInCode(lexeme, def);
        }
        else if (this.state == CodeState.end) {
            ret = this.handleEnd(lexeme, def);
        }
        this.lastLex = lexeme;
        this.lastLexEsc = lexeme == "\\";
        return ret;
    }
    handleStart(lexeme, def) {
        if (lexeme == "```") {
            this.state = CodeState.langtype;
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleLangtype(lexeme, def) {
        if (utils_1.isLineEnd(lexeme)) {
            this.state = CodeState.in_code;
        }
        else {
            this.codeType += lexeme.replace(/^\s*/, "").replace(/\s*$/, "");
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleInCode(lexeme, def) {
        if (utils_1.isLineEnd(this.lastLex) && lexeme == "```") {
            this.state = CodeState.end;
            return types_1.BlockActions.DONE;
        }
        if (utils_1.isLineEnd(lexeme)) {
            this.pushLine();
        }
        else {
            this.buff += lexeme;
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleEnd(lexeme, def) {
        return types_1.BlockActions.REJECT;
    }
    cloneInstance() {
        return new CodeHandler();
    }
    handlerEnd() {
        if (this.buff != "" && !utils_1.isLineEnd(this.lastLex)) {
            this.pushLine();
        }
    }
    toString() {
        const codeClass = "markdown-block-code" + (this.codeType != "" ? "-" + this.codeType : "");
        return (`<pre class="${codeClass}">` +
            escape_html_1.escapeHtml(this.lines.join("\n")) +
            "</pre>");
    }
}
exports.CodeHandler = CodeHandler;
class CodeIndentedHandler extends CodeHandler {
    getName() {
        return "code:indented";
    }
    canAccept(lexeme, def) {
        return lexeme.startsWith("    ");
    }
    handleStart(lexeme, def) {
        this.buff += lexeme;
        this.state = CodeState.in_code;
        return types_1.BlockActions.CONTINUE;
    }
    handleInCode(lexeme, def) {
        if (utils_1.isLineEnd(lexeme)) {
            if (utils_1.isLineEnd(this.lastLex)) {
                this.state = CodeState.end;
                return types_1.BlockActions.DONE;
            }
            else {
                this.pushLine();
                return types_1.BlockActions.CONTINUE;
            }
        }
        if ((def === null || def === void 0 ? void 0 : def.type) == lexdef_lookaheads_1.LEXEME_TYPE_WHITESPACE_START &&
            !lexeme.startsWith("    ")) {
            this.state = CodeState.end;
            return types_1.BlockActions.REJECT;
        }
        this.buff += lexeme;
        return types_1.BlockActions.CONTINUE;
    }
    pushLine() {
        this.lines.push(this.buff.substr(4));
        this.buff = "";
    }
    cloneInstance() {
        return new CodeIndentedHandler();
    }
}
exports.CodeIndentedHandler = CodeIndentedHandler;
