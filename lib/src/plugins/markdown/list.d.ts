import { BlockNestableBase } from "../../defaults/block-nestable-base";
import { BlockActions, BlockHandlerType, DocProcContext, HandlerInterface, LexemeDef } from "../../types";
import { DocProcessor } from "../../doc-processor";
export declare class ListItemContainer {
    context: DocProcContext;
    id: number;
    subDoc: DocProcessor;
    constructor(context: DocProcContext, containerId: number);
    push(lexeme: string, def?: LexemeDef): void;
    toString(): string;
}
/**
 * Supports the following list item styles:
 *
 * - `1. list item`
 * - `1) list item`
 * - `* list item`
 * - `- list item`
 *
 * Note that indenting by at least the length of the starting line's delimiter
 * will support full markdown syntax:
 *
 * ```markdown
 * - item 1
 *   ** item continued**
 *   > you can do a blockquote!
 *   - subitem
 *     > blockquote under subitem
 *     |maybe|a   |table
 *     |---  |--- |---
 *     |while|ur  |at it
 *
 * 1. ordered item
 *    similar thing
 * ```
 *
 */
export declare class ListHandler extends BlockNestableBase {
    static getListStyle(listStart: string): string;
    getName(): string;
    listStyle: string;
    indents: {
        ws: string;
        depth: number;
    }[];
    lastIndent: {
        ws: string;
        depth: number;
    };
    items: ListItemContainer[];
    curItem?: ListItemContainer;
    canAccept(lexeme: string, def?: LexemeDef): boolean;
    isItemStart(lexeme: string, def?: LexemeDef): boolean;
    /**
     * Does this line match the indent of the last line
     * @param lexeme
     */
    isLineIndented(lexeme: string): boolean;
    protected inItem: boolean;
    protected detectNewLine: boolean;
    /**
     * @param lexeme
     * @param def
     */
    push(lexeme: string, def?: LexemeDef): BlockActions;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): string;
}
