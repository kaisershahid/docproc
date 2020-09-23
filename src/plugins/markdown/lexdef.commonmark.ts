import {
  LexemeDefMap,
  LexemeLookaheadReturn,
  LexerInterface,
} from "../../types";
import { startingListItemDashStarLookahead } from "./lexdef.lookaheads";
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

const TYPE_ESCAPE = "esc";
const TYPE_STAR = "*";
const TYPE_UNDERSCORE = "_";
const TYPE_TILDE = "~";
const TYPE_BACKTICK = "`";
const TYPE_DASH = "-";
const TYPE_EQUAL = "=";
const TYPE_GREATER = ">";
const TYPE_HASH = "#";
const TYPE_PARENTHESIS = "()";
const TYPE_BRACKET = "[]";
const TYPE_IMG_START = "![";
const TYPE_PUNCTUATION = ".!?";

const SPECIAL_TOKENS: LexemeDefMap = {
  "\\": { priority: 99, type: TYPE_ESCAPE },
  _: {
    priority: 20,
    upTo: 2,
    type: TYPE_UNDERSCORE,
  },
  [LEXEME_KEY_NUM]: {
    priority: 20,
    type: "number",
    lookahead: (content, lexeme, i) => {
      let lookahead = startingListItemDashStarLookahead(content, lexeme, i);
      if (!lookahead) {
        lookahead = numberLookahead(content, lexeme, i);
      }
      return lookahead;
    },
  },
  "*": {
    priority: 20,
    type: TYPE_STAR,
    lookahead: startingListItemDashStarLookahead,
  },
  "-": {
    priority: 20,
    type: TYPE_DASH,
    lookahead: startingListItemDashStarLookahead,
  },
  "~": { priority: 20, upTo: 100, type: TYPE_TILDE }, // @todo maybe do -1 instead
  "`": { priority: 20, upTo: 3, type: TYPE_BACKTICK }, // @todo redo this as a lookahead so we only return for ` or ```, not ``
  "=": { priority: 20, upTo: 3, type: TYPE_EQUAL },
  ">": { priority: 20, upTo: 5, type: TYPE_GREATER }, // could do more?
  "#": { priority: 20, upTo: 6, type: TYPE_HASH },
  "(": { priority: 20, type: TYPE_PARENTHESIS },
  ")": { priority: 20, type: TYPE_PARENTHESIS },
  "[": { priority: 20, type: TYPE_BRACKET },
  "]": { priority: 20, type: TYPE_BRACKET },
  "![": { priority: 21, type: TYPE_IMG_START },
  "!": { priority: 20, type: TYPE_PUNCTUATION },
  ".": { priority: 20, type: TYPE_PUNCTUATION },
  "?": { priority: 20, type: TYPE_PUNCTUATION },
};

export const addToLexer = (lexer: LexerInterface, overwrite?: boolean) => {
  lexer.mergeLexemes({ ...WHITESPACE, ...SPECIAL_TOKENS }, overwrite);
};
