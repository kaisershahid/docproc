"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParagraphHandler = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const handler_manager_1 = require("../handler-manager");
/**
 * Barebones handler that defaults to <p/>.
 * @todo remove paragraph.ts?
 */
class ParagraphHandler {
    constructor() {
        this.lastLex = "";
        this.inlineFormatter = types_1.InlineFormatterDummy;
        this.buff = "";
    }
    setContext(context) {
        this.context = context;
        this.inlineFormatter = context.getInlineFormatter();
    }
    getName() {
        return handler_manager_1.NAME_DEFAULT;
    }
    canAccept(lexeme) {
        return true;
    }
    /**
     * Collects lexemes into a paragraph. If the leading lexemes are empty (e.g. all whitespace)
     * or is a newline, `DEFER` is returned to allow for a potentially better handler to pick up.
     *
     * One case to demonstrate where `DEFER` is useful:
     *
     * ```markdown
     * > paragraph1
     * > > paragraph 2
     * > paragraph 3
     * ```
     *
     * @param lexeme
     * @param def
     * @todo there's a minor bug with whitespace from next line being added on to previous element -- see the list.handler
     *       and blockquote.handler test cases with space before </>
     */
    push(lexeme, def) {
        const lineEnd = utils_1.isLineEnd(lexeme);
        if (lineEnd && utils_1.isLineEnd(this.lastLex))
            return types_1.BlockActions.DONE;
        this.buff += lexeme.replace(/^\s+/, "");
        this.lastLex = lexeme;
        this.inlineFormatter.push(lexeme);
        return this.buff == "" || utils_1.isWhitespace(lexeme)
            ? types_1.BlockActions.DEFER
            : types_1.BlockActions.CONTINUE;
    }
    cloneInstance() {
        return new ParagraphHandler();
    }
    toString() {
        const content = utils_1.trimString(this.inlineFormatter.toString());
        return content != "" ? "<p>" + content + "</p>" : "";
    }
}
exports.ParagraphHandler = ParagraphHandler;
