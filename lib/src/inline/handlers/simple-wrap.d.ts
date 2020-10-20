import { HandlerInterface, InlineActions, InlineHandlerType, LexemeDef } from "../../types";
import { BaseHandler } from "./base";
/**
 * Generic inline formatter that wraps text with matching opening/closing lexemes. Suitable
 * for things like `**`, `*`, `\``, etc.
 */
export declare class SimpleWrapHandler extends BaseHandler {
    handleLex: string;
    startTag: string;
    endTag: string;
    constructor(handleLex: string, startTag: string, endTag: string);
    getName(): string;
    lastLex: string;
    lastLexEscaped: boolean;
    inTag: boolean;
    closed: boolean;
    canAccept(lexeme: string): boolean;
    nextAction(lexeme: string): InlineActions;
    isEnclosingLex(lexeme: string, def?: LexemeDef): boolean;
    /**
     * If the enclosing tag is encountered (and not escaped), defer control to this method.
     * This is used to signal opening and closing of tag
     * @param lexeme
     * @param def
     * @protected
     */
    protected handleEnclosingLex(lexeme: string, def?: LexemeDef): InlineActions;
    /**
     * If enclosing tag is not encountered but we're inTag, defer control to this method.
     * @param lexeme
     * @param def
     * @protected
     */
    protected handlePush(lexeme: string, def?: LexemeDef): InlineActions;
    /**
     * If enclosing tag is not encountered but we're closed, defer control to this method.
     * Note that this is the least likely method to override.
     * @param lexeme
     * @param def
     * @protected
     */
    protected handleClose(lexeme: string, def?: LexemeDef): InlineActions;
    push(lexeme: string, def?: LexemeDef | undefined): any;
    toString(): string;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
}
