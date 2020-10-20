"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockquoteHandler = void 0;
const block_nestable_base_1 = require("../../defaults/block-nestable-base");
/**
 * Supports blockquotes with `>`:
 *
 * ```markdown
 * > paragraph
 * >> nested blockquote paragraph
 * >>> \`\`\`
 * >>> nested code
 * >>> 2 levels deep
 * >>> \`\`\`
 * ```
 *
 * Note that there are no limits to syntax support -- the entire structure
 * is handled within a blockquote.
 */
class BlockquoteHandler extends block_nestable_base_1.BlockNestableBase {
    getName() {
        return "blockquote";
    }
    canAccept(lexeme) {
        return lexeme[0] == ">";
    }
    isLexemeIndented(lexeme) {
        return lexeme[0] == ">";
    }
    getUnindentedLexeme(lexeme) {
        return lexeme.substr(1).replace(/^\s+/, "");
    }
    cloneInstance() {
        return new BlockquoteHandler();
    }
    toString() {
        return "<blockquote>" + this.getSubDoc().toString() + "</blockquote>";
    }
}
exports.BlockquoteHandler = BlockquoteHandler;
