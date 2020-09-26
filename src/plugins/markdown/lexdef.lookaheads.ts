import { LexemeDef, LexemeLookaheadReturn } from "../../types";
import { isLineEnd } from "../../utils";

export const REGEX_WHITESPACE_START = /^([ \t]*)/;
export const REGEX_LIST_ITEM_START = /^(\d+[.)]|-|\*)\s+/;
export const REGEX_LIST_ITEM_START_LEXEME = /^([ \t]*\d+[.)]|-|\*)/;
export const REGEX_HORIZONTAL_RULE = /^[-*]{3,}/;

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
export const startingListItemDashStarLookahead = (
  content: string,
  lexeme: string,
  i: number,
  curDef: LexemeDef
): LexemeLookaheadReturn | any => {
  const last = content[i - lexeme.length - 1];
  // we want either `undefined` or a line end
  if (last !== undefined && !isLineEnd(last)) {
    if (curDef.upTo) {
      let repeated = consumeRepeatingChars(
        lexeme,
        content,
        i - lexeme.length,
        curDef.upTo
      );
      if (repeated.length > 1) {
        return {
          newLexeme: repeated,
          nextIndex: i - lexeme.length + repeated.length,
        };
      }
    }
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
  let hrMatch = itemStart.match(REGEX_HORIZONTAL_RULE);
  if (hrMatch) {
    i = wsLookahead.nextIndex;
    lexeme = content[i];
    let repeated = consumeRepeatingChars(
      content[wsLookahead.nextIndex],
      content,
      wsLookahead.nextIndex
    );

    // repeating, so not an item start
    if (repeated.length > 1) {
      const newLexemeDef =
        repeated.length > 2 ? { type: LEXEME_TYPE_HORZ_RULE_START } : undefined;
      return {
        newLexeme: repeated,
        nextIndex: wsLookahead.nextIndex + repeated.length,
        newLexemeDef,
      };
    }
  }

  let match = itemStart.match(REGEX_LIST_ITEM_START);
  if (!match) {
    return wsLookahead.nextIndex >= i ? wsLookahead : undefined;
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

export const consumeRepeatingChars = (
  char: string,
  source: string,
  start: number,
  limit = -1
): string => {
  let found = 0;
  let i = start;
  while (true && (found < limit || limit == -1)) {
    if (source[i] == char) {
      found++;
      i += char.length;
      continue;
    }

    break;
  }

  return char.repeat(found);
};

/**
 * Unvalidated, loose interpretation of tag start.
 */
export const REGEX_HTML_TAG_UNVALIDATED_START = /^(<\/?[^\s]+)/;
export const REGEX_HTML_TAG_UNVALIDATED_START_OPEN = /^(<[^\s]+)/;
export const REGEX_HTML_TAG_UNVALIDATED_START_CLOSE = /^(<\/[^\s]+)/;
export const LEXEME_TYPE_HTML_TAG_START = "html:tag-start";

export const startHtmlTagLookahead = (
  content: string,
  lexeme: string,
  i: number,
  curDef: LexemeDef
): LexemeLookaheadReturn | any => {
  const tagSubstr = content.substr(i - lexeme.length, 20);
  const tagMatch = tagSubstr.match(REGEX_HTML_TAG_UNVALIDATED_START);
  if (!tagMatch) {
    return;
  }

  return {
    newLexeme: tagMatch[1],
    nextIndex: i - lexeme.length + tagMatch[1].length,
    newLexemeDef: {
      type: LEXEME_TYPE_HTML_TAG_START,
    },
  };
};
