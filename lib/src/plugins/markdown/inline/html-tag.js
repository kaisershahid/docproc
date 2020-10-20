"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlTagHandler = exports.HtmlTagState = void 0;
const base_1 = require("../../../inline/handlers/base");
const types_1 = require("../../../types");
const lexdef_lookaheads_1 = require("../lexdef.lookaheads");
var HtmlTagState;
(function (HtmlTagState) {
    HtmlTagState[HtmlTagState["start"] = 0] = "start";
    HtmlTagState[HtmlTagState["tag_start"] = 1] = "tag_start";
    HtmlTagState[HtmlTagState["tag_open"] = 2] = "tag_open";
    HtmlTagState[HtmlTagState["tag_closing"] = 3] = "tag_closing";
    HtmlTagState[HtmlTagState["tag_closed"] = 4] = "tag_closed";
})(HtmlTagState = exports.HtmlTagState || (exports.HtmlTagState = {}));
/**
 * Properly follows state of tag tokens to only apply embedded formatting to the tag.
 * Currently expects attribute values to be properly encoded (more specifically, `>`
 * literal shouldn't be in there).
 */
class HtmlTagHandler extends base_1.BaseHandler {
    constructor() {
        super(...arguments);
        this.state = HtmlTagState.start;
        this.lastLex = "";
        this.lastLexEsc = false;
        this.tagName = "";
    }
    nextAction(lexeme) {
        if (this.state == HtmlTagState.tag_closed)
            return types_1.InlineActions.REJECT;
        else if (this.state == HtmlTagState.tag_open)
            return types_1.InlineActions.DEFER;
        else
            return types_1.InlineActions.CONTINUE;
    }
    canAccept(lexeme) {
        return lexdef_lookaheads_1.REGEX_HTML_TAG_UNVALIDATED_START_OPEN.test(lexeme);
    }
    cloneInstance() {
        return new HtmlTagHandler();
    }
    getName() {
        return "html-tag";
    }
    push(lexeme, def) {
        let ret = types_1.InlineActions.REJECT;
        switch (this.state) {
            case HtmlTagState.start:
                ret = this.handleStart(lexeme, def);
                break;
            case HtmlTagState.tag_start:
                ret = this.handleTagStart(lexeme, def);
                break;
            case HtmlTagState.tag_open:
                ret = this.handleTagOpen(lexeme, def);
                break;
            case HtmlTagState.tag_closing:
                ret = this.handleTagClosing(lexeme, def);
                break;
            case HtmlTagState.tag_closed:
                ret = this.handleTagClosed(lexeme, def);
                break;
        }
        this.lastLex = lexeme;
        this.lastLexEsc = lexeme == "\\";
        return ret;
    }
    toString() {
        return this.words.join("");
    }
    /**
     * Returns true if '/>' is found in lexeme.
     * @param lexeme
     */
    isInlineTagEnd(lexeme) {
        return lexeme.indexOf("/>") > -1;
    }
    isTagStartDone(lexeme) {
        return lexeme.indexOf(">") > -1;
    }
    handleStart(lexeme, def) {
        if (lexdef_lookaheads_1.REGEX_HTML_TAG_UNVALIDATED_START_OPEN.test(lexeme)) {
            this.tagName = lexeme.substr(1);
            this.words.push(lexeme);
            this.state = HtmlTagState.tag_start;
            return types_1.InlineActions.NEST;
        }
        return types_1.InlineActions.REJECT;
    }
    handleTagStart(lexeme, def) {
        this.words.push(lexeme);
        if (this.isInlineTagEnd(lexeme)) {
            this.state = HtmlTagState.tag_closed;
            return types_1.InlineActions.POP;
        }
        else if (this.isTagStartDone(lexeme)) {
            this.state = HtmlTagState.tag_open;
            return types_1.InlineActions.DEFER;
        }
        return types_1.InlineActions.CONTINUE;
    }
    handleTagOpen(lexeme, def) {
        this.words.push(lexeme);
        if (lexdef_lookaheads_1.REGEX_HTML_TAG_UNVALIDATED_START_CLOSE.test(lexeme) &&
            this.tagName == lexeme.substr(2)) {
            this.state = HtmlTagState.tag_closing;
            return types_1.InlineActions.CONTINUE;
        }
        return types_1.InlineActions.DEFER;
    }
    handleTagClosing(lexeme, def) {
        if (lexeme !== ">") {
            return types_1.InlineActions.REJECT;
        }
        this.words.push(lexeme);
        this.state = HtmlTagState.tag_closed;
        return types_1.InlineActions.POP;
    }
    handleTagClosed(lexeme, def) {
        return types_1.InlineActions.REJECT;
    }
}
exports.HtmlTagHandler = HtmlTagHandler;
