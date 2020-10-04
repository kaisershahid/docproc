import { BlockBase } from "../../defaults/block-base";
import { BlockHandlerType, HandlerInterface, LexemeConsumer, LexemeDef } from "../../types";
export declare enum EnclosingTagState {
    start = 0,
    tag_starting = 1,
    tag_open = 2,
    tag_closing = 3,
    tag_closed = 4
}
/**
 * Detects and treats specific HTML tags as block elements, such that all content within the same tag is treated as a
 * single block, with some caveats:
 *
 * - For tags in {@see LiteralBodyTags} like `<style/>`, tag content is passed through
 * - For tags in {@see ContainerTags} like `<body/>`, content is treated as a sub-document, so that markdown block
 *   processing continues to apply
 * - otherwise, content is treated like inline text.
 */
export declare class HtmlBlockHandler extends BlockBase implements HandlerInterface<BlockHandlerType> {
    pusher: LexemeConsumer;
    closer: () => void;
    constructor();
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
    isContainer: boolean;
    tagName: string;
    tagOpenStart: string;
    tagCloseStart: string;
    tagsOpen: number;
    private handleStart;
    private handleTagStarting;
    protected setToContainerPush(): void;
    protected setToPassthroughPush(): void;
    protected setToInlinePush(): void;
    private handleTagOpen;
    private handleTagClosing;
    private handleTagClosed;
    toString(): string;
}
