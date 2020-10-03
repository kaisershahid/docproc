import { BlockBase } from "../../defaults/block-base";
import { BlockHandlerType, HandlerInterface, LexemeDef } from "../../types";
export declare enum EnclosingTagState {
    start = 0,
    tag_starting = 1,
    tag_open = 2,
    tag_closing = 3,
    tag_closed = 4
}
/**
 * Detects block-level tags and treats its content as a single block. For LiteralBodyTags,
 * all content is passed through as-is.
 */
export declare class HtmlBlockHandler extends BlockBase implements HandlerInterface<BlockHandlerType> {
    /**
     * Only handle tags defined in BlockTags.
     * @param lexeme
     * @param def
     */
    canAccept(lexeme: string, def: LexemeDef | undefined): boolean;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    getName(): string;
    handlerEnd(): void;
    lastLex: string;
    state: EnclosingTagState;
    buff: any[];
    push(lexeme: string, def: LexemeDef | undefined): any;
    tagName: string;
    tagCloseStart: string;
    private handleStart;
    private handleTagStarting;
    private handleTagOpen;
    private handleTagClosing;
    private handleTagClosed;
    toString(): string;
}
