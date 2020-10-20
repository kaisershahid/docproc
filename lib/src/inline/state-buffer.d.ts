import { InlineHandlerInterface } from "./index";
import { DocProcContext, HandlerInterface, HandlerManagerInterface, InlineActions, InlineFormatterInterface, InlineHandlerType, LexemeDef, TypedMap } from "../types";
import { DefaultParentHandler } from "./handlers/default-parent";
export declare const actionShouldUseNewHandler: (action: InlineActions) => boolean;
export declare const actionIsDeferred: (action: InlineActions) => boolean;
/**
 * Collects lexemes into a properly nested structure of handlers and words.
 */
export declare class InlineStateBuffer implements InlineFormatterInterface {
    protected manager: HandlerManagerInterface<InlineHandlerType>;
    protected defaultHandler: DefaultParentHandler;
    protected stack: HandlerInterface<InlineHandlerType>[];
    protected handlersByLex: TypedMap<InlineHandlerInterface>;
    protected context: DocProcContext;
    constructor(context: DocProcContext);
    push(lex: string, def?: LexemeDef): void;
    /**
     * Attempt to find a new handler for the lexeme. If found, push to stack and return true.
     * Otherwise, return false.
     * @param lex
     * @param def
     * @protected
     */
    protected wasNewHandlerFoundAndPushedForLex(lex: string, def?: LexemeDef): boolean;
    findHandler(lex: string): HandlerInterface<InlineHandlerType> | null;
    toString(): string;
}
