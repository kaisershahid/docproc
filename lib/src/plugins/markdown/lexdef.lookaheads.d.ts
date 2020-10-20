import { LexemeDef, LexemeLookaheadReturn } from "../../types";
export declare const REGEX_WHITESPACE_START: RegExp;
export declare const REGEX_LIST_ITEM_START: RegExp;
export declare const REGEX_LIST_ITEM_START_LEXEME: RegExp;
export declare const REGEX_HORIZONTAL_RULE: RegExp;
export declare const LEXEME_TYPE_WHITESPACE_START = "whitespace:starting";
export declare const LEXEME_TYPE_LIST_ITEM_START = "list-item:starting";
export declare const LEXEME_TYPE_HORZ_RULE_START = "horizontal-rule:starting";
/**
 * Returns if previous char was new line and next position has 1+ whitespaces
 * @param content
 * @param lexeme
 * @param i
 */
export declare const startingWhitespaceLookahead: (content: string, lexeme: string, i: number) => LexemeLookaheadReturn | any;
/**
 * Will produce a new lexeme on the following main conditions:
 *
 * - spaces/tabs (1+) at beginning of doc or after new line
 * - ...or followed by a single list item (-|*|1.|1))
 * - ...or followed by multiple -/* (horizontal rule)
 *
 * IF the lexeme isn't immediately after a newline and `upTo` is defined,
 * the fallback will attempt to get up to the specified repetitions.
 *
 * @param content
 * @param lexeme
 * @param i
 * @param curDef
 */
export declare const startingListItemDashStarLookahead: (content: string, lexeme: string, i: number, curDef: LexemeDef) => LexemeLookaheadReturn | any;
export declare const consumeRepeatingChars: (char: string, source: string, start: number, limit?: number) => string;
/**
 * Unvalidated, loose interpretation of tag start.
 */
export declare const REGEX_HTML_TAG_UNVALIDATED_START: RegExp;
export declare const REGEX_HTML_TAG_UNVALIDATED_START_OPEN: RegExp;
export declare const REGEX_HTML_TAG_UNVALIDATED_START_CLOSE: RegExp;
export declare const LEXEME_TYPE_HTML_TAG_START = "html:tag-start";
export declare const startHtmlTagLookahead: (content: string, lexeme: string, i: number, curDef: LexemeDef) => LexemeLookaheadReturn | any;
