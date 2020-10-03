import { LexemeDef, LexemeConsumer, LexerInterface, LexemeDefMap } from "./types";
export declare const LEXEME_KEY_ALPHA = "_@_@_alpha";
export declare const alphabetLookahead: (content: string, lexeme: string, i: number) => {
    newLexeme: string;
    nextIndex: number;
} | undefined;
export declare const alphabetDefinition: LexemeDef;
export declare const LEXEME_KEY_NUM = "_@_@_num";
export declare const numberLookahead: (content: string, lexeme: string, i: number) => {
    newLexeme: string;
    nextIndex: number;
} | undefined;
/**
 * Default definition for numbers matching:
 *
 * - whole numbers (`/\d+/`)
 * - fractional numbers (`/\d+\.\d+/`)
 * - loose hexadecimal (`/\dx[\da-zA-Z]+/`)
 * - exponential (`\d+e-?\d+/`)
 */
export declare const numberDefinition: LexemeDef;
export declare const backslashDefinition: LexemeDef;
/**
 * Reference lexer. Default instance contains following ability:
 *
 * - differentiate words with {@see alphabetDefinition}
 * - differentiate numbers with {@see numberDefinition}
 * - handle escaped character
 *
 * definitions.
 */
export declare class Lexer implements LexerInterface {
    protected definedLexemes: LexemeDefMap;
    protected _lex: string;
    protected _lex_def: LexemeDef | undefined;
    reset(): LexerInterface;
    setLexeme(lexeme: string, def: LexemeDef): LexerInterface;
    mergeLexemes(map: LexemeDefMap, overwrite?: boolean): LexerInterface;
    /**
     * Attempt to map given lexeme to a definition. If a direct match isn't found, check if the first
     * character matches either an alphabet or number (defined by lexemes
     * {@see LEXEME_KEY_ALPHA} and {@see LEXEME_KEY_NUM}).
     */
    findDefinition(lexeme: string): LexemeDef | undefined;
    lex(content: string, collector: LexemeConsumer): LexerInterface;
    complete(collector: LexemeConsumer): LexerInterface;
}
