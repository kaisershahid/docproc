"use strict";
// @todo html handler that allows block-level elements (div, blockquote, table, p, aside, header, nav, dl)
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlBlockHandler = exports.EnclosingTagState = void 0;
const block_base_1 = require("../../defaults/block-base");
const types_1 = require("../../types");
const lexdef_lookaheads_1 = require("./lexdef.lookaheads");
const doc_processor_1 = require("../../doc-processor");
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
/**
 * A type of block tag that supports full Markdown parsing within its body.
 */
const ContainerTags = {
    div: "div",
    body: "body",
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
 * Detects and treats specific HTML tags as block elements, such that all content within the same tag is treated as a
 * single block, with some caveats:
 *
 * - For tags in {@see LiteralBodyTags} like `<style/>`, tag content is passed through
 * - For tags in {@see ContainerTags} like `<body/>`, content is treated as a sub-document, so that markdown block
 *   processing continues to apply
 * - otherwise, content is treated like inline text.
 */
class HtmlBlockHandler extends block_base_1.BlockBase {
    constructor() {
        super();
        this.lastLex = "";
        this.state = EnclosingTagState.start;
        this.buff = [];
        this.isContainer = false;
        this.tagName = "";
        this.tagOpenStart = "";
        this.tagCloseStart = "";
        // for container tags, ensure content containing same-name tags have a matching close to avoid premature close of container
        this.tagsOpen = 0;
        this.pusher = (lex, def) => {
            this.buff.push(lex);
        };
        this.closer = () => { };
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
        this.tagOpenStart = "<" + this.tagName;
        this.tagCloseStart = "</" + lexeme.substr(1);
        this.state = EnclosingTagState.tag_starting;
        return types_1.BlockActions.CONTINUE;
    }
    handleTagStarting(lexeme, def) {
        this.buff.push(lexeme);
        if (lexeme == ">") {
            this.state = EnclosingTagState.tag_open;
            if (ContainerTags[this.tagName] !== undefined) {
                this.setToContainerPush();
            }
            else if (LiteralBodyTags[this.tagName] !== undefined) {
                this.setToPassthroughPush();
            }
            else {
                this.setToInlinePush();
            }
        }
        return types_1.BlockActions.CONTINUE;
    }
    setToContainerPush() {
        const docproc = new doc_processor_1.DocProcessor(this.context);
        this.pusher = (lexeme, def) => {
            docproc.push(lexeme, def);
        };
        this.closer = () => {
            docproc.complete();
        };
        this.buff.push(docproc);
    }
    setToPassthroughPush() {
        this.pusher = (lexeme, def) => {
            this.buff.push(lexeme, def);
        };
    }
    setToInlinePush() {
        this.pusher = (lexeme, def) => {
            this.inlineFormatter.push(lexeme, def);
        };
        this.buff.push(this.inlineFormatter);
    }
    handleTagOpen(lexeme, def) {
        if (lexeme === this.tagCloseStart) {
            if (this.tagsOpen == 0) {
                this.buff.push(lexeme);
                this.state = EnclosingTagState.tag_closing;
            }
            else {
                this.pusher(lexeme, def);
                this.tagsOpen--;
            }
        }
        else {
            if (lexeme.toLowerCase() == this.tagOpenStart) {
                this.tagsOpen++;
            }
            this.pusher(lexeme, def);
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
