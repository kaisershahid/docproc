"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToLexer = void 0;
const lexdef_lookaheads_1 = require("./lexdef.lookaheads");
const lexer_1 = require("../../lexer");
const TYPE_NEWLINE = "whitespace:newline";
const TYPE_SPACE = "whitespace";
const TYPE_TAB = "whitespace:tab";
const WHITESPACE = {
    "\n": { priority: 8, type: TYPE_NEWLINE },
    "\r": { priority: 8, type: TYPE_NEWLINE },
    "\r\n": { priority: 9, type: TYPE_NEWLINE },
    " ": {
        priority: 7,
        type: TYPE_SPACE,
        lookahead: lexdef_lookaheads_1.startingListItemDashStarLookahead,
    },
    "\t": {
        priority: 7,
        type: TYPE_TAB,
        lookahead: lexdef_lookaheads_1.startingListItemDashStarLookahead,
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
const SPECIAL_TOKENS = {
    "\\": { priority: 99, type: LEXEME_TYPE_ESCAPE },
    _: {
        priority: 2,
        upTo: 2,
        type: LEXEME_TYPE_UNDERSCORE,
    },
    [lexer_1.LEXEME_KEY_NUM]: {
        priority: 2,
        type: "number",
        lookahead: (content, lexeme, i, curDef) => {
            let lookahead = lexdef_lookaheads_1.startingListItemDashStarLookahead(content, lexeme, i, curDef);
            if (!lookahead) {
                lookahead = lexer_1.numberLookahead(content, lexeme, i);
            }
            return lookahead;
        },
    },
    "*": {
        priority: 2,
        upTo: 2,
        type: LEXEME_TYPE_STAR,
        lookahead: lexdef_lookaheads_1.startingListItemDashStarLookahead,
    },
    "-": {
        priority: 2,
        type: LEXEME_TYPE_DASH,
        lookahead: lexdef_lookaheads_1.startingListItemDashStarLookahead,
    },
    "<": {
        priority: 2,
        type: LEXEME_TYPE_HTML_TAG,
        lookahead: lexdef_lookaheads_1.startHtmlTagLookahead,
    },
    "~": { priority: 2, upTo: 100, type: LEXEME_TYPE_TILDE },
    "`": { priority: 2, upTo: 3, type: LEXEME_TYPE_BACKTICK },
    "=": { priority: 2, upTo: 3, type: LEXEME_TYPE_EQUAL },
    ">": { priority: 2, upTo: 5, type: LEXEME_TYPE_GREATER },
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
exports.addToLexer = (lexer, overwrite) => {
    lexer.mergeLexemes({ ...WHITESPACE, ...SPECIAL_TOKENS }, overwrite);
};
