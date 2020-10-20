import { BaseLinkHandler, Link } from "../markdown/inline/link";
import { HandlerInterface, InlineActions, InlineFormatterInterface, InlineHandlerType, LexemeDef } from "../../types";
export declare class Var extends Link {
    constructor(params: {
        url?: InlineFormatterInterface;
    });
    setToReference(): this;
    toJSON(): void;
}
/**
 * Handles the following dynamic inline markup:
 *
 * ```
 * [][var.name]           # use '.' for sub-keys
 * [](general expression) # not yet supported
 * ```
 */
export declare class DinoInlineHandler extends BaseLinkHandler {
    constructor();
    getName(): string;
    getNewLinkInstance(): Link;
    protected handleStart(lexeme: string, def?: LexemeDef): InlineActions;
    toString(): string;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
}
