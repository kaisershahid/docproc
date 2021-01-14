"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderHandler = exports.Header = exports.HEADER_DATA_CATEGORY = exports.REGEX_HEADER_START = void 0;
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const block_base_1 = require("../../defaults/block-base");
exports.REGEX_HEADER_START = /^#{1,6}/;
exports.HEADER_DATA_CATEGORY = "header";
class Header {
    /**
     *
     * @param level
     * @param context
     * @param idx suffix to ensure uniqueness for same-content headers
     */
    constructor(level, context, idx) {
        this.id = "";
        this.content = "";
        this.idx = idx;
        this.level = level;
        this.formatter = context.getInlineFormatter();
    }
    push(lexeme, def) {
        this.formatter.push(lexeme, def);
    }
    getId() {
        if (this.id !== "") {
            return this.id;
        }
        this.content = this.formatter.toString();
        let norm = this.content
            .replace(/^\s+/g, "")
            .replace(/\s$/g, "")
            .replace(/[^\w-]+/g, "-")
            .toLowerCase();
        this.id = `${norm}-${this.idx}`;
        return this.id;
    }
    toString() {
        const id = this.getId();
        return `<h${this.level} id="${id}">${this.content}</h${this.level}>`;
    }
    getItem() {
        return {
            id: this.getId(),
            content: this.content,
            level: this.level,
        };
    }
}
exports.Header = Header;
/**
 * Handle headers <h1/> ... <h6/>
 */
class HeaderHandler extends block_base_1.BlockBase {
    constructor() {
        super(...arguments);
        this.lastLex = "";
        this.headers = [];
        this.isClosed = false;
    }
    getName() {
        return "header";
    }
    canAccept(lexeme, def) {
        return exports.REGEX_HEADER_START.test(lexeme);
    }
    curHeader() {
        const idx = this.headers.length - 1;
        const header = this.headers[idx];
        if (!header) {
            throw new Error("no current header");
        }
        return header;
    }
    handlerEnd() {
        var _a;
        if (this.isClosed) {
            return;
        }
        this.isClosed = true;
        const item = this.curHeader().getItem();
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.dataRegistry.addItem(exports.HEADER_DATA_CATEGORY, item);
    }
    push(lexeme, def) {
        const lastLineEnd = utils_1.isLineEnd(this.lastLex);
        const lastLex = this.lastLex;
        this.lastLex = lexeme;
        if (exports.REGEX_HEADER_START.test(lexeme)) {
            return this.pushHeaderStart(lexeme, lastLex);
        }
        else if (lastLineEnd) {
            if (utils_1.isLineEnd(lexeme)) {
                return types_1.BlockActions.DONE;
            }
            return types_1.BlockActions.REJECT;
        }
        else if (!utils_1.isLineEnd(lexeme)) {
            this.curHeader().push(lexeme, def);
            return types_1.BlockActions.CONTINUE;
        }
        else {
            this.handlerEnd();
        }
        return types_1.BlockActions.CONTINUE;
    }
    pushHeaderStart(lexeme, lastLex) {
        if (lastLex == "" || utils_1.isLineEnd(lastLex)) {
            const level = lexeme.length;
            const context = this.context;
            this.isClosed = false;
            this.headers.push(new Header(level, context, context.dataRegistry.count(exports.HEADER_DATA_CATEGORY) + 1));
        }
        return types_1.BlockActions.CONTINUE;
    }
    cloneInstance() {
        return new HeaderHandler();
    }
    toString() {
        return this.headers.join("\n");
    }
}
exports.HeaderHandler = HeaderHandler;
