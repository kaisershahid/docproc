import { ParagraphHandler } from "./paragraph";
import { BlockActions, BlockHandlerType, HandlerInterface, LexemeDef, LexemePair } from "../../types";
export declare enum LinkrefState {
    start = 0,
    key_open = 1,
    key_closed = 2,
    semicolon_found = 3,
    url_open = 4,
    url_closed = 5,
    comment_open = 6,
    comment_closed = 7
}
export declare class Linkref {
    key: string;
    url: string;
    comment: string;
}
export declare const addLinkrefToRegistry: (ref: Linkref) => void;
export declare const getLinkrefByKey: (key: string) => Linkref | undefined;
/**
 * This version of the paragraph handles consecutive lines structured as:
 *
 * ```markdown
 * [key1]: link
 * [key2]: link (comment (\) escaped closing parenthesis supported here but not part of spec)
 * ```
 *
 * If a line doesn't start with `[` it's rejected but any previously found links
 * are registered. If the reference starts but doesn't conform to syntax, the entire
 * block is reverted to a normal paragraph.
 */
export declare class LinkrefParagraphHandler extends ParagraphHandler {
    getName(): string;
    protected lexStart: string;
    inGoodShape: boolean;
    lastLexEsc: boolean;
    linkref: Linkref;
    lastLink?: Linkref;
    linkrefs: Linkref[];
    lineBuff: LexemePair[];
    refState: LinkrefState;
    canAccept(lexeme: string): boolean;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    /**
     * State transitions overview:
     *
     * ```
     * start: '^\[' -> key_open                  # expect '[
     * key_open: '[^\]]*\]' -> key_closed          # also accepts '\\]'; build key close at ']'
     * key_closed: ':' -> semicolon_found        # expect ':'
     * semicolon_found: '[^\s]+' -> url_open     # build url with non-whitespaces
     * url_open: '[^\s]*' -> url_closed          # whitespace ends url
     * url_closed: '\(' -> comment_open          # open parenthesis starts comment
     * comment_open: '[^)]*\)' -> comment_closed # also accepts '\\)'; build comment and close at ')'
     * ```
     * @param lexeme
     * @param def
     * @protected
     */
    protected handleStates(lexeme: string, def?: LexemeDef): BlockActions;
    /**
     * Commit the current linkref if we're not falling back to paragraph.
     */
    handlerEnd(): void;
    /**
     * Badly structured link ref on a line, so undo everything ;(
     * @protected
     */
    protected notInGoodShape(): void;
    protected handleStart(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleKeyOpen(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleKeyClosed(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleSemicolonFound(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleUrlOpen(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleUrlClosed(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleCommentOpen(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleCommentClosed(lexeme: string, def?: LexemeDef): BlockActions;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): string;
}
