"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageHandler = exports.LinkHandler = exports.BaseLinkHandler = exports.Link = exports.LinkMode = exports.LinkType = exports.LinkHandlerState = void 0;
const base_1 = require("../../../inline/handlers/base");
const types_1 = require("../../../types");
const escape_html_1 = require("../../../utils_/escape-html");
const linkref_paragraph_1 = require("../linkref-paragraph");
var LinkHandlerState;
(function (LinkHandlerState) {
    LinkHandlerState[LinkHandlerState["start"] = 0] = "start";
    LinkHandlerState[LinkHandlerState["text_open"] = 1] = "text_open";
    LinkHandlerState[LinkHandlerState["text_closed"] = 2] = "text_closed";
    LinkHandlerState[LinkHandlerState["url_open"] = 3] = "url_open";
    LinkHandlerState[LinkHandlerState["url_closed"] = 4] = "url_closed";
})(LinkHandlerState = exports.LinkHandlerState || (exports.LinkHandlerState = {}));
var LinkType;
(function (LinkType) {
    LinkType[LinkType["anchor"] = 0] = "anchor";
    LinkType[LinkType["img"] = 1] = "img";
})(LinkType = exports.LinkType || (exports.LinkType = {}));
var LinkMode;
(function (LinkMode) {
    LinkMode[LinkMode["url"] = 0] = "url";
    LinkMode[LinkMode["ref"] = 1] = "ref";
})(LinkMode = exports.LinkMode || (exports.LinkMode = {}));
class Link {
    constructor(params) {
        this.type = LinkType.anchor;
        this.mode = LinkMode.url;
        const { text, url, context } = params;
        this.ctx = context;
        this.text = text;
        this.url = url;
    }
    setToImage() {
        this.type = LinkType.img;
        return this;
    }
    setToReference() {
        this.mode = LinkMode.ref;
        return this;
    }
    toString() {
        return this.type == LinkType.img ? this.toImage() : this.toAnchor();
    }
    resolveUrl() {
        const url = this.url.toString();
        if (this.mode == LinkMode.ref) {
            const ref = linkref_paragraph_1.getLinkrefByKey(url);
            return ref?.url ?? url;
        }
        return url;
    }
    toImage() {
        const buff = ['<img src="'];
        buff.push(escape_html_1.escapeHtml(this.resolveUrl()));
        buff.push('" alt="');
        buff.push(escape_html_1.escapeHtml(this.text.toString()));
        buff.push('" />');
        return buff.join("");
    }
    toAnchor() {
        const buff = ['<a href="'];
        const text = this.text.toString();
        buff.push(this.resolveUrl());
        buff.push('" alt="');
        buff.push(escape_html_1.escapeHtml(text));
        buff.push('">');
        buff.push(text);
        buff.push("</a>");
        return buff.join("");
    }
}
exports.Link = Link;
/**
 * Handles image and anchor elements:
 *
 * ```
 * [Link Text](http://urll)
 * [Link Text][ref]   -> [ref]: http://url
 * ![Image Alt](http://src)
 * ![Image Alt][ref]  -> [ref]: http://src
 * ```
 */
class BaseLinkHandler extends base_1.BaseHandler {
    constructor(opener) {
        super();
        this.state = LinkHandlerState.start;
        this.lastLex = "";
        this.lastLexEsc = false;
        this.link = {};
        this.undoBuffer = [];
        this.isInvalid = true;
        this.opener = opener;
    }
    canAccept(lexeme) {
        return lexeme == this.opener;
    }
    nextAction(lexeme) {
        if (this.state == LinkHandlerState.text_open) {
            // @todo verify we don't need to defer since the link maintains its own inline buffer for text
            return types_1.InlineActions.CONTINUE;
        }
        else if (this.state == LinkHandlerState.text_closed &&
            (lexeme == "[" || lexeme == "(")) {
            return types_1.InlineActions.CONTINUE;
        }
        else if (this.state == LinkHandlerState.url_open) {
            return types_1.InlineActions.CONTINUE;
        }
        return types_1.InlineActions.REJECT;
    }
    /**
     * State transitions overview:
     *
     * ```
     * start: '!?\[' -> text_open       # start building alt/display text
     * text_open: '[^\]]+' -> text_open # also accepts '\\]'; build alt/display text
     * text_open: '\]' -> text_closed   #
     * text_closed: '[(\[]' -> url_open # start building url/ref
     * url_open: '[^\])]+' -> url_open  # build url/ref
     * url_open: '[\])]' -> url_closed  # done with link
     * ```
     *
     * > Note: whichever token opens the url/ref will allow the alternate token
     * > (e.g. `(url)` will accept `[]`)
     *
     * @param lexeme
     * @param def
     */
    push(lexeme, def) {
        let ret = types_1.InlineActions.REJECT;
        switch (this.state) {
            case LinkHandlerState.start:
                ret = this.handleStart(lexeme, def);
                break;
            case LinkHandlerState.text_open:
                ret = this.handleTextOpen(lexeme, def);
                break;
            case LinkHandlerState.text_closed:
                ret = this.handleTextClosed(lexeme, def);
                break;
            case LinkHandlerState.url_open:
                ret = this.handleUrlOpen(lexeme, def);
                break;
            case LinkHandlerState.url_closed:
                ret = this.handleUrlClosed(lexeme, def);
                break;
        }
        if (ret !== types_1.InlineActions.REJECT) {
            this.undoBuffer.push(lexeme);
        }
        this.lastLex = lexeme;
        this.lastLexEsc = lexeme == "\\";
        return ret;
    }
    getNewLinkInstance() {
        const context = this._context;
        return new Link({
            context,
            text: context?.getInlineFormatter(),
            url: context?.getInlineFormatter(),
        });
    }
    handleStart(lexeme, def) {
        if (lexeme == this.opener) {
            this.state = LinkHandlerState.text_open;
            this.link = this.getNewLinkInstance();
            if (this.opener == "![") {
                this.link.setToImage();
            }
            return types_1.InlineActions.CONTINUE;
        }
        return types_1.InlineActions.REJECT;
    }
    handleTextOpen(lexeme, def) {
        if (lexeme == "]" && !this.lastLexEsc) {
            this.state = LinkHandlerState.text_closed;
        }
        else if (lexeme != "\\") {
            this.link.text.push(lexeme, def);
        }
        return types_1.InlineActions.CONTINUE;
    }
    handleTextClosed(lexeme, def) {
        if (lexeme == "[") {
            this.state = LinkHandlerState.url_open;
            this.link.setToReference();
            return types_1.InlineActions.CONTINUE;
        }
        else if (lexeme == "(") {
            this.state = LinkHandlerState.url_open;
            return types_1.InlineActions.CONTINUE;
        }
        else {
            return types_1.InlineActions.REJECT;
        }
    }
    handleUrlOpen(lexeme, def) {
        if (!this.lastLexEsc) {
            if (this.link.mode == LinkMode.url && lexeme == ")") {
                this.isInvalid = false;
                this.state = LinkHandlerState.url_closed;
                return types_1.InlineActions.POP;
            }
            else if (this.link.mode == LinkMode.ref && lexeme == "]") {
                this.isInvalid = false;
                this.state = LinkHandlerState.url_closed;
                return types_1.InlineActions.POP;
            }
            else if (lexeme != "\\") {
                this.link.url.push(lexeme, def);
                return types_1.InlineActions.CONTINUE;
            }
        }
        else {
            this.link.url.push(lexeme, def);
            return types_1.InlineActions.CONTINUE;
        }
        return types_1.InlineActions.REJECT;
    }
    handleUrlClosed(lexeme, def) {
        return types_1.InlineActions.REJECT;
    }
    toString() {
        if (this.isInvalid) {
            return this.undoBuffer.join("");
        }
        return this.link.toString();
    }
}
exports.BaseLinkHandler = BaseLinkHandler;
class LinkHandler extends BaseLinkHandler {
    constructor() {
        super("[");
    }
    getName() {
        return "anchor";
    }
    cloneInstance() {
        return new LinkHandler();
    }
}
exports.LinkHandler = LinkHandler;
class ImageHandler extends BaseLinkHandler {
    constructor() {
        super("![");
    }
    getName() {
        return "image";
    }
    cloneInstance() {
        return new ImageHandler();
    }
}
exports.ImageHandler = ImageHandler;
