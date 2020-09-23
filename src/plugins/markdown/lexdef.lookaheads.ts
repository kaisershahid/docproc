import { LexemeLookaheadReturn } from "../../types";
import { isLineEnd } from "../../utils";

export const REGEX_WHITESPACE_START = /^([ \t]*)/;
export const REGEX_LIST_ITEM_START = /^(\d+[.)]|-|\*)\s+/;
export const REGEX_LIST_ITEM_START_LEXEME = /^([ \t]*\d+[.)]|-|\*)/;

export const LEXEME_TYPE_WHITESPACE_START = "whitespace:starting";
export const LEXEME_TYPE_LIST_ITEM_START = "list-item:starting";
export const LEXEME_TYPE_HORZ_RULE_START = "horizontal-rule:starting";

/**
 * Returns if previous char was new line and next position has 1+ whitespaces
 * @param content
 * @param lexeme
 * @param i
 */
export const startingWhitespaceLookahead = (
  content: string,
  lexeme: string,
  i: number
): LexemeLookaheadReturn | any => {
  const last = content[i - 2];

  // we want either `undefined` or a line end
  if (last !== undefined && !isLineEnd(last)) {
    return;
  }

  // rewind, then scan forward 100 chars (no sane person would go beyond that right?)
  i -= 1;
  const substr = content.substr(i, 100);
  const wsMatch = substr.match(REGEX_WHITESPACE_START) as RegExpMatchArray;
  return wsMatch[1] == ""
    ? undefined
    : {
        newLexeme: wsMatch[1],
        nextIndex: i + wsMatch[1].length,
        newLexemeDef: {
          type: LEXEME_TYPE_WHITESPACE_START,
        },
      };
};

/**
 * Will produce a new lexeme on the following conditions:
 *
 * - spaces/tabs (1+) at beginning of doc or after new line
 * - ...or followed by a single list item (-|*|1.|1))
 * - ...or followed by multiple -/* (horizontal rule)
 *
 * @param content
 * @param lexeme
 * @param i
 */
export const startingListItemDashStarLookahead = (
  content: string,
  lexeme: string,
  i: number
): LexemeLookaheadReturn | any => {
  const last = content[i - 2];
  // we want either `undefined` or a line end
  if (last !== undefined && !isLineEnd(last)) {
    return;
  }

  // gives us our whitespace indent. if no whitespace found after line end boundary,
  // nextIndex is set to before i, so that we know this lookup failed for fallback
  const wsLookahead = {
    newLexeme: "",
    nextIndex: i - 1,
    ...(startingWhitespaceLookahead(content, lexeme, i) ?? {}),
  };

  const itemStart = content.substr(wsLookahead.nextIndex, 3);
  let match = itemStart.match(REGEX_LIST_ITEM_START);

  // no -/*, so no special cases
  if (!match) {
    return wsLookahead.nextIndex >= i ? wsLookahead : undefined;
  }

  i = wsLookahead.nextIndex;
  lexeme = content[i];
  let type: string = LEXEME_TYPE_LIST_ITEM_START;

  // count repeats if -/*
  if (lexeme == "*" || lexeme == "-") {
    let j = i;
    do {
      if (content[j + 1] != lexeme) {
        break;
      }
    } while (j++);

    // repeating, so not an item start
    if (j > i) {
      const repeats = i + j - 1;
      const newLexemeDef =
        repeats > 2 ? { type: LEXEME_TYPE_HORZ_RULE_START } : undefined;
      return {
        newLexeme: lexeme.repeat(repeats),
        nextIndex: j,
        newLexemeDef,
      };
    }
  }

  // otherwise, item start
  return {
    newLexeme: wsLookahead.newLexeme + match[1],
    nextIndex: (wsLookahead.nextIndex ?? 0) + match[1].length,
    newLexemeDef: {
      type: LEXEME_TYPE_LIST_ITEM_START,
    },
  };
};
