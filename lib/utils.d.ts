export declare const isLineEnd: (str: string) => boolean;
export declare const isWhitespace: (str: string) => boolean;
/**
 * Determines indent level based on the string's start: if a tab is given,
 * `\t` will be used to determine levels, otherwise, ` ` (space) will be used.
 * Indent styles cannot be mixed.
 *
 * @param str
 * @param spaceIndent
 */
export declare const detectTabs: (str: string, spaceIndent?: number) => {
    char: string;
    tabs: number;
};
/**
 * Either maps the escaped string to a well-known sequence or removes backslash and returns
 * remainder.
 * @param str
 */
export declare const translateEscapedString: (str: string) => any;
export declare const returnUnescapedString: (str: string) => any;
export declare const trimString: (str: string) => string;
