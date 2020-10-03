import { SimpleWrapHandler } from "../../../inline/handlers/simple-wrap";
import { HandlerInterface, InlineActions, InlineHandlerType, LexemeDef } from "../../../types";
export declare enum InlineHandlerState {
    start = 0,
    opening = 1,
    opened = 2,
    closing = 3,
    closed = 4
}
export declare class StrikeHandler extends SimpleWrapHandler {
    constructor();
    canAccept(lexeme: string): boolean;
    isEnclosingLex(lexeme: string, def?: LexemeDef): boolean;
    state: InlineHandlerState;
    nextAction(lexeme: string): InlineActions;
    protected handleEnclosingLex(lexeme: string, def?: LexemeDef): InlineActions;
    protected handlePush(lexeme: string, def?: LexemeDef): InlineActions;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
}
