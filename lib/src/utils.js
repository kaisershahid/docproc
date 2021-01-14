"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimString = exports.returnUnescapedString = exports.translateEscapedString = exports.detectTabs = exports.isWhitespace = exports.isLineEnd = void 0;
exports.isLineEnd = (str) => str[0] == "\n" || str[0] == "\r";
exports.isWhitespace = (str) => !!str.match(/^\s*$/);
/**
 * Determines indent level based on the string's start: if a tab is given,
 * `\t` will be used to determine levels, otherwise, ` ` (space) will be used.
 * Indent styles cannot be mixed.
 *
 * @param str
 * @param spaceIndent
 */
exports.detectTabs = (str, spaceIndent = 4) => {
    const char = str[0] == "\t" ? "\t" : " ".repeat(spaceIndent);
    const clen = char.length;
    let tabs = 0;
    let i = 0;
    while (true) {
        const substr = str.substr(i, clen);
        if (substr == char) {
            tabs++;
            i += clen;
            continue;
        }
        break;
    }
    return { char, tabs };
};
const ESCAPE_MAP = {
    "\\n": "\n",
    "\\r": "\r",
    "\\t": "\t",
    "\\s": " ",
};
/**
 * Either maps the escaped string to a well-known sequence or removes backslash and returns
 * remainder.
 * @param str
 */
exports.translateEscapedString = (str) => {
    var _a;
    return (_a = ESCAPE_MAP[str]) !== null && _a !== void 0 ? _a : str.substr(1);
};
exports.returnUnescapedString = (str) => str[0] == "\\" ? exports.translateEscapedString(str) : str;
exports.trimString = (str) => str.replace(/^\s+/, "").replace(/\s+$/, "");
