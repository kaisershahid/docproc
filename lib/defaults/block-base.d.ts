import { ContextAwareInterface, DocProcContext, InlineFormatterInterface } from "../types";
export declare class BlockBase implements ContextAwareInterface {
    protected context?: DocProcContext;
    protected inlineFormatter: InlineFormatterInterface;
    setContext(context: DocProcContext): void;
}
