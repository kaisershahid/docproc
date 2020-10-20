import { BaseHandler } from "../../../inline/handlers/base";
import { HandlerInterface, InlineActions, InlineHandlerType, LexemeDef } from "../../../types";
export declare enum HtmlTagState {
    start = 0,
    tag_start = 1,
    tag_open = 2,
    tag_closing = 3,
    tag_closed = 4
}
/**
 * Properly follows state of tag tokens to only apply embedded formatting to the tag.
 * Currently expects attribute values to be properly encoded (more specifically, `>`
 * literal shouldn't be in there).
 */
export declare class HtmlTagHandler extends BaseHandler {
    nextAction(lexeme: string): InlineActions;
    canAccept(lexeme: string): boolean;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
    getName(): string;
    state: HtmlTagState;
    lastLex: string;
    lastLexEsc: boolean;
    tagName: string;
    push(lexeme: string, def: LexemeDef | undefined): any;
    toString(): string;
    /**
     * Returns true if '/>' is found in lexeme.
     * @param lexeme
     */
    isInlineTagEnd(lexeme: string): boolean;
    isTagStartDone(lexeme: string): boolean;
    private handleStart;
    private handleTagStart;
    private handleTagOpen;
    private handleTagClosing;
    private handleTagClosed;
}
