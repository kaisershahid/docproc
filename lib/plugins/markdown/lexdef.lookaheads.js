"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHtmlTagLookahead = exports.LEXEME_TYPE_HTML_TAG_START = exports.REGEX_HTML_TAG_UNVALIDATED_START_CLOSE = exports.REGEX_HTML_TAG_UNVALIDATED_START_OPEN = exports.REGEX_HTML_TAG_UNVALIDATED_START = exports.consumeRepeatingChars = exports.startingListItemDashStarLookahead = exports.startingWhitespaceLookahead = exports.LEXEME_TYPE_HORZ_RULE_START = exports.LEXEME_TYPE_LIST_ITEM_START = exports.LEXEME_TYPE_WHITESPACE_START = exports.REGEX_HORIZONTAL_RULE = exports.REGEX_LIST_ITEM_START_LEXEME = exports.REGEX_LIST_ITEM_START = exports.REGEX_WHITESPACE_START = void 0;
const utils_1 = require("../../utils");
exports.REGEX_WHITESPACE_START = /^([ \t]*)/;
exports.REGEX_LIST_ITEM_START = /^(\d+[.)]|-|\*)\s+/;
exports.REGEX_LIST_ITEM_START_LEXEME = /^([ \t]*\d+[.)]|-|\*)/;
exports.REGEX_HORIZONTAL_RULE = /^[-*]{3,}/;
exports.LEXEME_TYPE_WHITESPACE_START = "whitespace:starting";
exports.LEXEME_TYPE_LIST_ITEM_START = "list-item:starting";
exports.LEXEME_TYPE_HORZ_RULE_START = "horizontal-rule:starting";
/**
 * Returns if previous char was new line and next position has 1+ whitespaces
 * @param content
 * @param lexeme
 * @param i
 */
exports.startingWhitespaceLookahead = (content, lexeme, i) => {
    const last = content[i - 2];
    // we want either `undefined` or a line end
    if (last !== undefined && !utils_1.isLineEnd(last)) {
        return;
    }
    // rewind, then scan forward 100 chars (no sane person would go beyond that right?)
    i -= 1;
    const substr = content.substr(i, 100);
    const wsMatch = substr.match(exports.REGEX_WHITESPACE_START);
    return wsMatch[1] == ""
        ? undefined
        : {
            newLexeme: wsMatch[1],
            nextIndex: i + wsMatch[1].length,
            newLexemeDef: {
                type: exports.LEXEME_TYPE_WHITESPACE_START,
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
exports.startingListItemDashStarLookahead = (content, lexeme, i, curDef) => {
    const last = content[i - lexeme.length - 1];
    // first thing is check repetitions -- e.g. `**` will never equal `*` (start list) + `*` (emphasis) --
    if (lexeme[0] == "*" && curDef.upTo) {
        let repeated = exports.consumeRepeatingChars(lexeme, content, i - lexeme.length, curDef.upTo);
        if (repeated.length > 1) {
            return {
                newLexeme: repeated,
                nextIndex: i - lexeme.length + repeated.length,
            };
        }
    }
    // we want either `undefined` or a line end
    if (last !== undefined && !utils_1.isLineEnd(last)) {
    }
    // gives us our whitespace indent. if no whitespace found after line end boundary,
    // nextIndex is set to before i, so that we know this lookup failed for fallback
    const wsLookahead = {
        newLexeme: "",
        nextIndex: i - 1,
        ...(exports.startingWhitespaceLookahead(content, lexeme, i) ?? {}),
    };
    const itemStart = content.substr(wsLookahead.nextIndex, 3);
    let hrMatch = itemStart.match(exports.REGEX_HORIZONTAL_RULE);
    if (hrMatch) {
        i = wsLookahead.nextIndex;
        lexeme = content[i];
        let repeated = exports.consumeRepeatingChars(content[wsLookahead.nextIndex], content, wsLookahead.nextIndex);
        // repeating, so not an item start
        if (repeated.length > 1) {
            const newLexemeDef = repeated.length > 2 ? { type: exports.LEXEME_TYPE_HORZ_RULE_START } : undefined;
            return {
                newLexeme: repeated,
                nextIndex: wsLookahead.nextIndex + repeated.length,
                newLexemeDef,
            };
        }
    }
    let match = itemStart.match(exports.REGEX_LIST_ITEM_START);
    if (!match) {
        return wsLookahead.nextIndex >= i ? wsLookahead : undefined;
    }
    // otherwise, item start
    return {
        newLexeme: wsLookahead.newLexeme + match[1],
        nextIndex: (wsLookahead.nextIndex ?? 0) + match[1].length,
        newLexemeDef: {
            type: exports.LEXEME_TYPE_LIST_ITEM_START,
        },
    };
};
exports.consumeRepeatingChars = (char, source, start, limit = -1) => {
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
exports.REGEX_HTML_TAG_UNVALIDATED_START = /^(<\/?\w[\w:]*)/;
exports.REGEX_HTML_TAG_UNVALIDATED_START_OPEN = /^(<\w[\w:]*)/;
exports.REGEX_HTML_TAG_UNVALIDATED_START_CLOSE = /^(<\/\w[\w:]*)/;
exports.LEXEME_TYPE_HTML_TAG_START = "html:tag-start";
exports.startHtmlTagLookahead = (content, lexeme, i, curDef) => {
    const tagSubstr = content.substr(i - lexeme.length, 20);
    const tagMatch = tagSubstr.match(exports.REGEX_HTML_TAG_UNVALIDATED_START);
    if (!tagMatch) {
        return;
    }
    return {
        newLexeme: tagMatch[1],
        nextIndex: i - lexeme.length + tagMatch[1].length,
        newLexemeDef: {
            type: exports.LEXEME_TYPE_HTML_TAG_START,
        },
    };
};
