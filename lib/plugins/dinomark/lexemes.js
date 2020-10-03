"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToLexer = exports.DINO_LEX_INLINE = exports.DINO_LEX_BLOCK = exports.DINO_LEX_TYPE_INLINE_DIRECTIVE = exports.DINO_LEX_TYPE_BLOCK_DIRECTIVE = void 0;
exports.DINO_LEX_TYPE_BLOCK_DIRECTIVE = "dinomark:block-dir";
exports.DINO_LEX_TYPE_INLINE_DIRECTIVE = "dinomark:inline-dir";
exports.DINO_LEX_BLOCK = "[@";
exports.DINO_LEX_INLINE = "[]";
const SPECIAL_TOKENS = {
    [exports.DINO_LEX_BLOCK]: { priority: 100, type: exports.DINO_LEX_TYPE_BLOCK_DIRECTIVE },
    [exports.DINO_LEX_INLINE]: { priority: 100, type: exports.DINO_LEX_TYPE_INLINE_DIRECTIVE },
};
exports.addToLexer = (lexer, overwrite) => {
    lexer.mergeLexemes({ ...SPECIAL_TOKENS }, true);
};
