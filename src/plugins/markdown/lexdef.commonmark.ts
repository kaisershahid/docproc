import {
  LexemeDefMap,
  LexemeLookaheadReturn,
  LexerInterface,
} from "../../types";
import {
  startHtmlTagLookahead,
  startingListItemDashStarLookahead,
} from "./lexdef.lookaheads";
import { LEXEME_KEY_NUM, numberDefinition, numberLookahead } from "../../lexer";

const TYPE_NEWLINE = "whitespace:newline";
const TYPE_SPACE = "whitespace";
const TYPE_TAB = "whitespace:tab";

const WHITESPACE: LexemeDefMap = {
  "\n": { priority: 8, type: TYPE_NEWLINE },
  "\r": { priority: 8, type: TYPE_NEWLINE },
  "\r\n": { priority: 9, type: TYPE_NEWLINE },
  " ": {
    priority: 7,
    type: TYPE_SPACE,
    lookahead: startingListItemDashStarLookahead,
  },
  "\t": {
    priority: 7,
    type: TYPE_TAB,
    lookahead: startingListItemDashStarLookahead,
  },
};

const LEXEME_TYPE_ESCAPE = "esc";
const LEXEME_TYPE_STAR = "*";
const LEXEME_TYPE_UNDERSCORE = "_";
const LEXEME_TYPE_TILDE = "~";
const LEXEME_TYPE_BACKTICK = "`";
const LEXEME_TYPE_DASH = "-";
const LEXEME_TYPE_EQUAL = "=";
const LEXEME_TYPE_GREATER = ">";
const LEXEME_TYPE_HASH = "#";
const LEXEME_TYPE_PARENTHESIS = "()";
const LEXEME_TYPE_BRACKET = "[]";
const LEXEME_TYPE_IMG_START = "![";
const LEXEME_TYPE_PUNCTUATION = ".!?";
const LEXEME_TYPE_PIPE = "|";
const LEXEME_TYPE_HTML_TAG = "<html-tag";
const LEXEME_TYPE_HTML_TAG_INLINE_CLOSE = "<html-tag: />";

const SPECIAL_TOKENS: LexemeDefMap = {
  "\\": { priority: 99, type: LEXEME_TYPE_ESCAPE },
  _: {
    priority: 2,
    upTo: 2,
    type: LEXEME_TYPE_UNDERSCORE,
  },
  [LEXEME_KEY_NUM]: {
    priority: 2,
    type: "number",
    lookahead: (content, lexeme, i, curDef) => {
      let lookahead = startingListItemDashStarLookahead(
        content,
        lexeme,
        i,
        curDef
      );
      if (!lookahead) {
        lookahead = numberLookahead(content, lexeme, i);
      }
      return lookahead;
    },
  },
  "*": {
    priority: 2,
    upTo: 80,
    type: LEXEME_TYPE_STAR,
    lookahead: startingListItemDashStarLookahead,
  },
  "-": {
    priority: 2,
    type: LEXEME_TYPE_DASH,
    lookahead: startingListItemDashStarLookahead,
  },
  "<": {
    priority: 2,
    type: LEXEME_TYPE_HTML_TAG,
    lookahead: startHtmlTagLookahead,
  },
  "~": { priority: 2, upTo: 100, type: LEXEME_TYPE_TILDE }, // @todo maybe do -1 instead
  "`": { priority: 2, upTo: 3, type: LEXEME_TYPE_BACKTICK }, // @todo redo this as a lookahead so we only return for ` or ```, not ``
  "=": { priority: 2, upTo: 3, type: LEXEME_TYPE_EQUAL },
  ">": { priority: 2, upTo: 5, type: LEXEME_TYPE_GREATER }, // could do more?
  "/>": { priority: 2, type: LEXEME_TYPE_HTML_TAG_INLINE_CLOSE },
  "#": { priority: 2, upTo: 6, type: LEXEME_TYPE_HASH },
  "(": { priority: 2, type: LEXEME_TYPE_PARENTHESIS },
  ")": { priority: 2, type: LEXEME_TYPE_PARENTHESIS },
  "[": { priority: 2, type: LEXEME_TYPE_BRACKET },
  "]": { priority: 2, type: LEXEME_TYPE_BRACKET },
  "![": { priority: 21, type: LEXEME_TYPE_IMG_START },
  "!": { priority: 2, type: LEXEME_TYPE_PUNCTUATION },
  ".": { priority: 2, type: LEXEME_TYPE_PUNCTUATION },
  "?": { priority: 2, type: LEXEME_TYPE_PUNCTUATION },
  "|": { priority: 21, type: LEXEME_TYPE_PIPE },
};

export const addToLexer = (lexer: LexerInterface, overwrite?: boolean) => {
  lexer.mergeLexemes({ ...WHITESPACE, ...SPECIAL_TOKENS }, overwrite);
};
