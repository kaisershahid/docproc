import { LexemeDefMap, LexerInterface } from "../../types";

const TYPE_NEWLINE = "whitespace:newline";
const TYPE_SPACE = "whitespace";
const TYPE_TAB = "whitespace:tab";

const WHITESPACE: LexemeDefMap = {
  "\n": { priority: 8, type: TYPE_NEWLINE },
  "\r": { priority: 8, type: TYPE_NEWLINE },
  "\r\n": { priority: 9, type: TYPE_NEWLINE },
  " ": { priority: 10, type: TYPE_SPACE, upTo: 100 }, // @todo maybe do -1 instead
  "\t": { priority: 10, type: TYPE_TAB, upTo: 100 }, // @todo maybe do -1 instead
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
  _: { priority: 20, upTo: 2, type: TYPE_UNDERSCORE },
  "*": { priority: 20, upTo: 3, type: TYPE_STAR },
  "~": { priority: 20, upTo: 100, type: TYPE_TILDE }, // @todo maybe do -1 instead
  "`": { priority: 20, upTo: 3, type: TYPE_BACKTICK },
  "-": { priority: 20, upTo: 3, type: TYPE_DASH },
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
