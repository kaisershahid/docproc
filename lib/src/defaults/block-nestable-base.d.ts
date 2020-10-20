import { BlockActions, BlockHandlerType, HandlerInterface, LexemeDef } from "../types";
import { BlockBase } from "./block-base";
import { DocProcessor } from "../doc-processor";
/**
 * Provides a convenient abstraction to check if lexemes define a nestable block
 * structure (for markdown, this would be blockquotes and list items) by maintaining
 * an internal {@see DocProcessor} to build up the document described in the nesting.
 *
 * In general, maintaining an internal {@see DocProcessor} lets you support the complete
 * document syntax and formatting in any nestable part of the document.
 */
export declare class BlockNestableBase extends BlockBase implements HandlerInterface<BlockHandlerType> {
    protected static id: number;
    protected id: number;
    lastLex: string;
    inBlock: boolean;
    subDoc?: DocProcessor;
    constructor();
    getName(): string;
    canAccept(lexeme: string): boolean;
    protected getSubDoc(): DocProcessor;
    isLexemeIndented(lexeme: string, def?: LexemeDef): boolean;
    getUnindentedLexeme(lexeme: string, def?: LexemeDef): string;
    protected pushToSubDoc(lexeme: string, def?: LexemeDef): void;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): void;
}
