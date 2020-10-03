import { BlockActions, BlockHandlerType, HandlerInterface, LexemeDef } from "../../types";
import { BlockBase } from "../../defaults/block-base";
export declare enum CodeState {
    start = 0,
    langtype = 1,
    in_code = 2,
    end = 3
}
/**
 * Handle multiline <pre/>.
 */
export declare class CodeHandler extends BlockBase implements HandlerInterface<BlockHandlerType> {
    state: CodeState;
    codeType: string;
    lastLex: string;
    lastLexEsc: boolean;
    buff: string;
    lines: string[];
    protected pushLine(): void;
    getName(): string;
    canAccept(lexeme: string, def?: LexemeDef): boolean;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleStart(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleLangtype(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleInCode(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleEnd(lexeme: string, def?: LexemeDef): BlockActions;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    handlerEnd(): void;
    toString(): string;
}
export declare class CodeIndentedHandler extends CodeHandler {
    getName(): string;
    canAccept(lexeme: string, def?: LexemeDef): boolean;
    protected handleStart(lexeme: string, def?: LexemeDef): BlockActions;
    protected handleInCode(lexeme: string, def?: LexemeDef): BlockActions;
    protected pushLine(): void;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
}
