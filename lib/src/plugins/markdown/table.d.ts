import { BlockActions, BlockHandlerType, DocProcContext, HandlerInterface, InlineFormatterInterface, LexemeDef } from "../../types";
import { BlockBase } from "../../defaults/block-base";
export declare class TableRow {
    cells: TableCell[];
    isHeader: boolean;
    push(cell: TableCell): void;
    curCell(): TableCell;
    setAsHeader(): void;
    toString(): string;
}
export declare class TableCell {
    context: DocProcContext;
    formatter: InlineFormatterInterface;
    tag: string;
    constructor(context: DocProcContext);
    push(lexeme: string, def?: LexemeDef): void;
    setAsHeader(): void;
    buffToString(): string;
    toString(): string;
}
/**
 * Handle tables.
 */
export declare class TableHandler extends BlockBase {
    getName(): string;
    canAccept(lexeme: string, def?: LexemeDef): boolean;
    started: boolean;
    lastLex: string;
    lastLineEnd: boolean;
    rows: TableRow[];
    foundHeader: boolean;
    curRow(): TableRow;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    protected handlePipe(def?: LexemeDef): BlockActions;
    protected handleCell(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleLineEnd(def?: LexemeDef): BlockActions;
    protected detectAndSetHeader(): void;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): string;
}
