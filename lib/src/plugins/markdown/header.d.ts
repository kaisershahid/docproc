import { BlockActions, BlockHandlerType, DocProcContext, HandlerInterface, InlineFormatterInterface, LexemeDef } from "../../types";
import { BlockBase } from "../../defaults/block-base";
export declare const REGEX_HEADER_START: RegExp;
export declare const HEADER_DATA_CATEGORY = "header";
export declare type HeaderItem = {
    id: string;
    content: string;
    level: number;
};
export declare class Header {
    idx: number;
    id: string;
    content: string;
    level: number;
    formatter: InlineFormatterInterface;
    /**
     *
     * @param level
     * @param context
     * @param idx suffix to ensure uniqueness for same-content headers
     */
    constructor(level: number, context: DocProcContext, idx: number);
    push(lexeme: string, def?: LexemeDef): void;
    getId(): string;
    toString(): string;
    getItem(): HeaderItem;
}
/**
 * Handle headers <h1/> ... <h6/>
 */
export declare class HeaderHandler extends BlockBase {
    getName(): string;
    canAccept(lexeme: string, def?: LexemeDef): boolean;
    lastLex: string;
    headers: Header[];
    isClosed: boolean;
    curHeader(): Header;
    handlerEnd(): void;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    protected pushHeaderStart(lexeme: string, lastLex: string): BlockActions;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): string;
}
