import { SimpleWrapHandler } from "../../../inline/handlers/simple-wrap";
import { HandlerInterface, InlineActions, InlineHandlerType } from "../../../types";
export declare class CodeHandler extends SimpleWrapHandler {
    constructor();
    nextAction(lexeme: string): InlineActions;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
}
