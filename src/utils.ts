import { AnyMap } from "./types";

export const isLineEnd = (str: string) => str[0] == "\n" || str[0] == "\r";

export const isWhitespace = (str: string) => !!str.match(/^\s*$/);

/**
 * Determines indent level based on the string's start: if a tab is given,
 * `\t` will be used to determine levels, otherwise, ` ` (space) will be used.
 * Indent styles cannot be mixed.
 *
 * @param str
 * @param spaceIndent
 */
export const detectTabs = (
  str: string,
  spaceIndent = 4
): { char: string; tabs: number } => {
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

const ESCAPE_MAP: AnyMap = {
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
export const translateEscapedString = (str: string) => {
  return ESCAPE_MAP[str] ?? str.substr(1);
};

export const returnUnescapedString = (str: string) =>
  str[0] == "\\" ? translateEscapedString(str) : str;
