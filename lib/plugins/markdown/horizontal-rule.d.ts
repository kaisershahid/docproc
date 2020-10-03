import { BlockActions, BlockHandlerType, HandlerInterface, LexemeDef } from "../../types";
import { BlockBase } from "../../defaults/block-base";
/**
 * Handle horizontal rules.
 */
export declare class HorizontalRuleHandler extends BlockBase {
    getName(): string;
    canAccept(lexeme: string, def?: LexemeDef): boolean;
    rule: string[];
    lastLex: string;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    protected pushLine(): void;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): string;
}
