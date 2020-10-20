"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockNestableBase = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const block_base_1 = require("./block-base");
const doc_processor_1 = require("../doc-processor");
/**
 * Provides a convenient abstraction to check if lexemes define a nestable block
 * structure (for markdown, this would be blockquotes and list items) by maintaining
 * an internal {@see DocProcessor} to build up the document described in the nesting.
 *
 * In general, maintaining an internal {@see DocProcessor} lets you support the complete
 * document syntax and formatting in any nestable part of the document.
 */
class BlockNestableBase extends block_base_1.BlockBase {
    constructor() {
        super();
        this.id = 0;
        this.lastLex = "";
        this.inBlock = false;
        this.id = ++BlockNestableBase.id;
    }
    getName() {
        throw new Error("not implemented");
    }
    canAccept(lexeme) {
        return false;
    }
    getSubDoc() {
        if (!this.subDoc) {
            this.subDoc = new doc_processor_1.DocProcessor(this.context);
        }
        return this.subDoc;
    }
    isLexemeIndented(lexeme, def) {
        return false;
    }
    getUnindentedLexeme(lexeme, def) {
        throw new Error("not implemented");
    }
    pushToSubDoc(lexeme, def) {
        this.getSubDoc().push(lexeme, def);
    }
    push(lexeme, def) {
        if (this.isLexemeIndented(lexeme)) {
            this.inBlock = true;
            const substr = this.getUnindentedLexeme(lexeme);
            if (substr != "") {
                this.pushToSubDoc(substr, def);
            }
            return types_1.BlockActions.CONTINUE;
        }
        else if (!utils_1.isLineEnd(lexeme)) {
            if (this.inBlock) {
                this.pushToSubDoc(lexeme, def);
                return types_1.BlockActions.CONTINUE;
            }
            else {
                return types_1.BlockActions.REJECT;
            }
        }
        else {
            if (this.inBlock) {
                this.pushToSubDoc(lexeme, def);
                this.inBlock = false;
                return types_1.BlockActions.CONTINUE;
            }
            else {
                return types_1.BlockActions.DONE;
            }
        }
    }
    cloneInstance() {
        throw new Error("not implemented");
    }
    toString() {
        throw new Error("not implemented");
    }
}
exports.BlockNestableBase = BlockNestableBase;
BlockNestableBase.id = 0;
