import { LexerInterface } from "../../types";
export declare const DINO_LEX_TYPE_BLOCK_DIRECTIVE = "dinomark:block-dir";
export declare const DINO_LEX_TYPE_INLINE_DIRECTIVE = "dinomark:inline-dir";
export declare const DINO_LEX_BLOCK = "[@";
export declare const DINO_LEX_INLINE = "[]";
export declare const addToLexer: (lexer: LexerInterface, overwrite?: boolean | undefined) => void;
