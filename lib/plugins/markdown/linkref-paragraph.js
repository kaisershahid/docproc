"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkrefParagraphHandler = exports.getLinkrefByKey = exports.addLinkrefToRegistry = exports.Linkref = exports.LinkrefState = void 0;
const paragraph_1 = require("./paragraph");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
var LinkrefState;
(function (LinkrefState) {
    LinkrefState[LinkrefState["start"] = 0] = "start";
    LinkrefState[LinkrefState["key_open"] = 1] = "key_open";
    LinkrefState[LinkrefState["key_closed"] = 2] = "key_closed";
    LinkrefState[LinkrefState["semicolon_found"] = 3] = "semicolon_found";
    LinkrefState[LinkrefState["url_open"] = 4] = "url_open";
    LinkrefState[LinkrefState["url_closed"] = 5] = "url_closed";
    LinkrefState[LinkrefState["comment_open"] = 6] = "comment_open";
    LinkrefState[LinkrefState["comment_closed"] = 7] = "comment_closed";
})(LinkrefState = exports.LinkrefState || (exports.LinkrefState = {}));
class Linkref {
    constructor() {
        this.key = "";
        this.url = "";
        this.comment = "";
    }
}
exports.Linkref = Linkref;
const dummyLinkref = new Linkref();
const linkrefRegistry = {};
exports.addLinkrefToRegistry = (ref) => {
    linkrefRegistry[ref.key] = ref;
};
exports.getLinkrefByKey = (key) => linkrefRegistry[key];
/**
 * This version of the paragraph handles consecutive lines structured as:
 *
 * ```markdown
 * [key1]: link
 * [key2]: link (comment (\) escaped closing parenthesis supported here but not part of spec)
 * ```
 *
 * If a line doesn't start with `[` it's rejected but any previously found links
 * are registered. If the reference starts but doesn't conform to syntax, the entire
 * block is reverted to a normal paragraph.
 */
class LinkrefParagraphHandler extends paragraph_1.ParagraphHandler {
    constructor() {
        super(...arguments);
        this.lexStart = "[";
        this.inGoodShape = true;
        this.lastLexEsc = false;
        this.linkref = dummyLinkref;
        this.linkrefs = [];
        this.lineBuff = [];
        this.refState = LinkrefState.start;
    }
    getName() {
        return "linkref-paragraph";
    }
    canAccept(lexeme) {
        return lexeme == this.lexStart;
    }
    push(lexeme, def) {
        if (utils_1.isLineEnd(lexeme)) {
            if (utils_1.isLineEnd(this.lastLex)) {
                this.lineBuff = [];
                this.handlerEnd();
                return types_1.BlockActions.DONE;
            }
            else {
                this.handlerEnd();
                this.refState = LinkrefState.start;
                this.lastLex = lexeme;
                this.lastLexEsc = false;
                return types_1.BlockActions.CONTINUE;
            }
        }
        else if (lexeme == "\\") {
            this.lastLex = lexeme;
            this.lastLexEsc = true;
            return types_1.BlockActions.CONTINUE;
        }
        else if (!this.inGoodShape) {
            let ret = super.push(lexeme, def);
            return ret == types_1.BlockActions.DONE
                ? types_1.BlockActions.DONE
                : types_1.BlockActions.CONTINUE;
        }
        this.lineBuff.push({ lexeme, def });
        let ret = this.handleStates(lexeme, def);
        this.lastLex = lexeme;
        this.lastLexEsc = lexeme[0] == "\\";
        return ret;
    }
    /**
     * State transitions overview:
     *
     * ```
     * start: '^\[' -> key_open                  # expect '[
     * key_open: '[^\]]*\]' -> key_closed          # also accepts '\\]'; build key close at ']'
     * key_closed: ':' -> semicolon_found        # expect ':'
     * semicolon_found: '[^\s]+' -> url_open     # build url with non-whitespaces
     * url_open: '[^\s]*' -> url_closed          # whitespace ends url
     * url_closed: '\(' -> comment_open          # open parenthesis starts comment
     * comment_open: '[^)]*\)' -> comment_closed # also accepts '\\)'; build comment and close at ')'
     * ```
     * @param lexeme
     * @param def
     * @protected
     */
    handleStates(lexeme, def) {
        let ret = types_1.BlockActions.REJECT;
        const lstate = this.refState;
        switch (this.refState) {
            case LinkrefState.start:
                ret = this.handleStart(lexeme, def);
                break;
            case LinkrefState.key_open:
                ret = this.handleKeyOpen(lexeme, def);
                break;
            case LinkrefState.key_closed:
                ret = this.handleKeyClosed(lexeme, def);
                break;
            case LinkrefState.semicolon_found:
                ret = this.handleSemicolonFound(lexeme, def);
                break;
            case LinkrefState.url_open:
                ret = this.handleUrlOpen(lexeme, def);
                break;
            case LinkrefState.url_closed:
                ret = this.handleUrlClosed(lexeme, def);
                break;
            case LinkrefState.comment_open:
                ret = this.handleCommentOpen(lexeme, def);
                break;
            case LinkrefState.comment_closed:
                ret = this.handleCommentClosed(lexeme, def);
                break;
        }
        return ret;
    }
    /**
     * Commit the current linkref if we're not falling back to paragraph.
     */
    handlerEnd() {
        // @todo figure out why ` && this.refState >= LinkrefState.url_closed` is making this fail
        if (this.inGoodShape && this.lineBuff.length > 0) {
            if (this.linkref === this.lastLink) {
                return;
            }
            exports.addLinkrefToRegistry(this.linkref);
            this.linkrefs.push(this.linkref);
            this.lastLink = this.linkref;
            this.lineBuff = [];
        }
    }
    /**
     * Badly structured link ref on a line, so undo everything ;(
     * @protected
     */
    notInGoodShape() {
        this.inGoodShape = false;
        this.lineBuff.forEach(({ lexeme, def }) => {
            super.push(lexeme, def);
        });
        this.lineBuff = [];
    }
    handleStart(lexeme, def) {
        const lastLineEnd = utils_1.isLineEnd(this.lastLex);
        if (this.lastLex == "" || lastLineEnd) {
            // starting new line, so commit last ref
            if (lastLineEnd) {
                this.handlerEnd();
            }
            if (lexeme == this.lexStart) {
                this.refState = LinkrefState.key_open;
                this.linkref = new Linkref();
                return types_1.BlockActions.CONTINUE;
            }
        }
        return types_1.BlockActions.REJECT;
    }
    handleKeyOpen(lexeme, def) {
        if (utils_1.isLineEnd(lexeme)) {
            this.notInGoodShape();
        }
        else if (lexeme !== "]" || this.lastLexEsc) {
            this.linkref.key += lexeme;
        }
        else if (lexeme === "]") {
            this.refState = LinkrefState.key_closed;
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleKeyClosed(lexeme, def) {
        if (lexeme == ":") {
            this.refState = LinkrefState.semicolon_found;
        }
        else {
            this.notInGoodShape();
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleSemicolonFound(lexeme, def) {
        if (!utils_1.isWhitespace(lexeme)) {
            this.refState = LinkrefState.url_open;
            this.linkref.url = lexeme;
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleUrlOpen(lexeme, def) {
        if (this.linkref.url != "" && utils_1.isWhitespace(lexeme)) {
            this.refState = LinkrefState.url_closed;
        }
        else {
            this.linkref.url += lexeme;
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleUrlClosed(lexeme, def) {
        if (lexeme == "(") {
            this.refState = LinkrefState.comment_open;
        }
        else {
            this.notInGoodShape();
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleCommentOpen(lexeme, def) {
        if (lexeme !== ")" || this.lastLexEsc) {
            this.linkref.comment += lexeme;
        }
        else if (lexeme === ")") {
            this.refState = LinkrefState.comment_closed;
        }
        return types_1.BlockActions.CONTINUE;
    }
    handleCommentClosed(lexeme, def) {
        if (!utils_1.isWhitespace(lexeme)) {
            this.notInGoodShape();
        }
        return types_1.BlockActions.CONTINUE;
    }
    cloneInstance() {
        return new LinkrefParagraphHandler();
    }
    toString() {
        if (!this.inGoodShape) {
            return super.toString();
        }
        return "";
    }
}
exports.LinkrefParagraphHandler = LinkrefParagraphHandler;
