"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListHandler = exports.ListItemContainer = void 0;
const block_nestable_base_1 = require("../../defaults/block-nestable-base");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const lexdef_lookaheads_1 = require("./lexdef.lookaheads");
const doc_processor_1 = require("../../doc-processor");
const REGEX_CHECK_INDENT = /^(\s*)(\d+.|-|\*)/;
class ListItemContainer {
    constructor(context, containerId) {
        this.context = context;
        this.id = containerId;
        this.subDoc = new doc_processor_1.DocProcessor(context);
    }
    push(lexeme, def) {
        // console.log(this.id, "sub.push", { lexeme, def });
        this.subDoc.push(lexeme, def);
    }
    toString() {
        return `<li>${this.subDoc.toString()}</li>`;
    }
}
exports.ListItemContainer = ListItemContainer;
/**
 * Supports the following list item styles:
 *
 * - `1. list item`
 * - `1) list item`
 * - `* list item`
 * - `- list item`
 *
 * Note that indenting by at least the length of the starting line's delimiter
 * will support full markdown syntax:
 *
 * ```markdown
 * - item 1
 *   ** item continued**
 *   > you can do a blockquote!
 *   - subitem
 *     > blockquote under subitem
 *     |maybe|a   |table
 *     |---  |--- |---
 *     |while|ur  |at it
 *
 * 1. ordered item
 *    similar thing
 * ```
 *
 */
class ListHandler extends block_nestable_base_1.BlockNestableBase {
    constructor() {
        super(...arguments);
        this.listStyle = "";
        this.indents = [];
        this.lastIndent = { ws: "", depth: -1 };
        this.items = [];
        this.inItem = false;
        this.detectNewLine = false;
    }
    static getListStyle(listStart) {
        return listStart[0] == "*" || listStart[0] == "-" ? "ul" : "ol";
    }
    getName() {
        return "list";
    }
    canAccept(lexeme, def) {
        return (def === null || def === void 0 ? void 0 : def.type) == lexdef_lookaheads_1.LEXEME_TYPE_LIST_ITEM_START;
    }
    isItemStart(lexeme, def) {
        return (def === null || def === void 0 ? void 0 : def.type) == lexdef_lookaheads_1.LEXEME_TYPE_LIST_ITEM_START;
    }
    /**
     * Does this line match the indent of the last line
     * @param lexeme
     */
    isLineIndented(lexeme) {
        const lastWs = this.lastIndent.ws;
        const lexWs = lexeme.substr(0, lastWs.length);
        if (lexWs === lastWs) {
            return true;
        }
        return false;
    }
    /**
     * @param lexeme
     * @param def
     */
    push(lexeme, def) {
        var _a, _b, _c, _d, _e;
        if (this.isItemStart(lexeme, def)) {
            this.detectNewLine = false;
            const listStyle = ListHandler.getListStyle(lexeme.replace(/^\s*/, ""));
            const depth = lexeme.length;
            const tmp = lexdef_lookaheads_1.startingWhitespaceLookahead(lexeme, lexeme, 1);
            const ws = (_a = tmp === null || tmp === void 0 ? void 0 : tmp.newLexeme) !== null && _a !== void 0 ? _a : "";
            // if this is a child, the remainder after indent will be pushed to the item container
            let partial = lexeme.substr(ws.length);
            // starting list
            if (this.items.length == 0) {
                this.listStyle = listStyle;
                const item = new ListItemContainer(this.context, this.id);
                this.lastIndent = { ws, depth };
                this.items.push(item);
                this.curItem = item;
                return types_1.BlockActions.CONTINUE;
            }
            if (this.lastIndent.ws == ws) {
                // different list styles, so terminate this
                if (this.listStyle != "" && this.listStyle != listStyle) {
                    return types_1.BlockActions.REJECT;
                }
                // siblings
                const item = new ListItemContainer(this.context, this.id);
                this.items.push(item);
                this.curItem = item;
                return types_1.BlockActions.CONTINUE;
            }
            else if (this.isLineIndented(lexeme)) {
                // child
                (_b = this.curItem) === null || _b === void 0 ? void 0 : _b.push(partial, def);
                return types_1.BlockActions.CONTINUE;
            }
            else {
                // indents don't match, so retry as a new list
                return types_1.BlockActions.REJECT;
            }
        }
        else if (utils_1.isLineEnd(lexeme)) {
            // consecutive newlines
            if (this.detectNewLine) {
                return types_1.BlockActions.DONE;
            }
            (_c = this.curItem) === null || _c === void 0 ? void 0 : _c.push(lexeme, def);
            this.detectNewLine = true;
            return types_1.BlockActions.CONTINUE;
        }
        else if (!this.detectNewLine) {
            // continuation of item start line
            (_d = this.curItem) === null || _d === void 0 ? void 0 : _d.push(lexeme, def);
            return types_1.BlockActions.CONTINUE;
        }
        else if (this.isLineIndented(lexeme)) {
            // new line and indented to last item start
            this.detectNewLine = false;
            const partial = lexeme.substr(this.lastIndent.depth);
            (_e = this.curItem) === null || _e === void 0 ? void 0 : _e.push(partial, def);
            return types_1.BlockActions.CONTINUE;
        }
        return types_1.BlockActions.REJECT;
    }
    cloneInstance() {
        return new ListHandler();
    }
    toString() {
        return `<${this.listStyle}>\n${this.items.join("\n")}\n</${this.listStyle}>`;
    }
}
exports.ListHandler = ListHandler;
