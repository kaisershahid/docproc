import { DirectiveHandler, DirectiveDefinition } from "../directives";
import { BlockHandlerType, DocProcContext, HandlerInterface } from "../../../types";
export declare class DirectiveCaptureStart implements DirectiveHandler {
    static readonly DIRECTIVE = "capture";
    invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any;
}
/**
 * Removes blocks until block containing `capture` directive is found. If not found, no changes are made
 */
export declare class DirectiveCaptureEnd implements DirectiveHandler {
    static readonly DIRECTIVE = "end-capture";
    invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any;
    modifyBlocks(blocks: HandlerInterface<BlockHandlerType>[], def: DirectiveDefinition, context: DocProcContext): HandlerInterface<BlockHandlerType>[];
    private static isBlockCaptureStart;
    private static storeCapturedInVar;
}
