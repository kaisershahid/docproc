"use strict";
// @todo html handler that allows block-level elements (div, blockquote, table, p, aside, header, nav, dl)
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlBlockHandler = exports.EnclosingTagState = void 0;
const block_base_1 = require("../../defaults/block-base");
const types_1 = require("../../types");
const lexdef_lookaheads_1 = require("./lexdef.lookaheads");
/**
 * Only these tags enable the HTMLBlockHandler.
 */
const BlockTags = {
    div: "div",
    p: "p",
    blockquote: "blockquote",
    table: "table",
    aside: "aside",
    header: "header",
    footer: "footer",
    nav: "nav",
    body: "body",
    style: "style",
    script: "script",
    head: "head",
};
/**
 * The body of these tags should not be touched by the inline formatter.
 */
const LiteralBodyTags = {
    head: "head",
    style: "style",
    script: "script",
};
var EnclosingTagState;
(function (EnclosingTagState) {
    EnclosingTagState[EnclosingTagState["start"] = 0] = "start";
    EnclosingTagState[EnclosingTagState["tag_starting"] = 1] = "tag_starting";
    EnclosingTagState[EnclosingTagState["tag_open"] = 2] = "tag_open";
    EnclosingTagState[EnclosingTagState["tag_closing"] = 3] = "tag_closing";
    EnclosingTagState[EnclosingTagState["tag_closed"] = 4] = "tag_closed";
})(EnclosingTagState = exports.EnclosingTagState || (exports.EnclosingTagState = {}));
/**
 * Detects block-level tags and treats its content as a single block. For LiteralBodyTags,
 * all content is passed through as-is.
 */
class HtmlBlockHandler extends block_base_1.BlockBase {
    constructor() {
        super(...arguments);
        this.lastLex = "";
        this.state = EnclosingTagState.start;
        this.buff = [];
        this.tagName = "";
        this.tagCloseStart = "";
    }
    /**
     * Only handle tags defined in BlockTags.
     * @param lexeme
     * @param def
     */
    canAccept(lexeme, def) {
        return (lexdef_lookaheads_1.REGEX_HTML_TAG_UNVALIDATED_START_OPEN.test(lexeme) &&
            BlockTags[lexeme.substr(1).toLowerCase()]);
    }
    cloneInstance() {
        return new HtmlBlockHandler();
    }
    getName() {
        return "html-block";
    }
    handlerEnd() { }
    push(lexeme, def) {
        let ret = types_1.BlockActions.REJECT;
        switch (this.state) {
            case EnclosingTagState.start:
                ret = this.handleStart(lexeme, def);
                break;
            case EnclosingTagState.tag_starting:
                ret = this.handleTagStarting(lexeme, def);
                break;
            case EnclosingTagState.tag_open:
                ret = this.handleTagOpen(lexeme, def);
                break;
            case EnclosingTagState.tag_closing:
                ret = this.handleTagClosing(lexeme, def);
                break;
            case EnclosingTagState.tag_closed:
                ret = this.handleTagClosed(lexeme, def);
                break;
        }
        this.lastLex = lexeme;
        return ret;
    }
    handleStart(lexeme, def) {
        // @todo verify lexeme as tag open?
        this.buff.push(lexeme);
        this.tagName = lexeme.substr(1).toLowerCase();
        this.tagCloseStart = "</" + lexeme.substr(1);
        this.state = EnclosingTagState.tag_starting;
        return types_1.BlockActions.CONTINUE;
    }
    handleTagStarting(lexeme, def) {
        this.buff.push(lexeme);
        if (lexeme == ">") {
            this.state = EnclosingTagState.tag_open;
            // for now, we're treating everything between open and close as a single block
            this.buff.push(this.inlineFormatter);
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleTagOpen(lexeme, def) {
        if (lexeme === this.tagCloseStart) {
            this.buff.push(lexeme);
            this.state = EnclosingTagState.tag_closing;
        }
        else {
            LiteralBodyTags[this.tagName]
                ? this.buff.push(lexeme)
                : this.inlineFormatter.push(lexeme, def);
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleTagClosing(lexeme, def) {
        if (lexeme == ">") {
            this.state = EnclosingTagState.tag_closed;
            this.buff.push(lexeme);
            return types_1.BlockActions.DONE;
        }
        return types_1.BlockActions.REJECT;
    }
    handleTagClosed(lexeme, def) {
        return types_1.BlockActions.REJECT;
    }
    toString() {
        return this.buff.join("");
    }
}
exports.HtmlBlockHandler = HtmlBlockHandler;
