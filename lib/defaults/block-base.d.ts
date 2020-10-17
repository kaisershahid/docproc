import { BlockActions, BlockHandlerType, ContextAwareInterface, DocProcContext, HandlerInterface, InlineFormatterInterface, LexemeDef } from "../types";
export declare class BlockBase implements ContextAwareInterface {
    protected context?: DocProcContext;
    protected inlineFormatter: InlineFormatterInterface;
    setContext(context: DocProcContext): void;
}
export declare class BlockEmptyHandler extends BlockBase implements HandlerInterface<BlockHandlerType> {
    getName(): string;
    canAccept(lexeme: string, def?: LexemeDef): boolean;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): void;
}
