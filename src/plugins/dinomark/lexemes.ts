import { LexemeDefMap, LexerInterface } from "../../types";

export const DINO_LEX_TYPE_BLOCK_DIRECTIVE = "dinomark:block-dir";
export const DINO_LEX_TYPE_INLINE_DIRECTIVE = "dinomark:inline-dir";

export const DINO_LEX_BLOCK = "[@";
export const DINO_LEX_INLINE = "[]";

const SPECIAL_TOKENS: LexemeDefMap = {
  [DINO_LEX_BLOCK]: { priority: 100, type: DINO_LEX_TYPE_BLOCK_DIRECTIVE },
  [DINO_LEX_INLINE]: { priority: 100, type: DINO_LEX_TYPE_INLINE_DIRECTIVE },
};

export const addToLexer = (lexer: LexerInterface, overwrite?: boolean) => {
  lexer.mergeLexemes({ ...SPECIAL_TOKENS }, true);
};
