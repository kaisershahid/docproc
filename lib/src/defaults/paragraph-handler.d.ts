import { BlockActions, BlockHandlerType, DocProcContext, HandlerInterface, LexemeDef } from "../types";
/**
 * Barebones handler that defaults to <p/>.
 * @todo remove paragraph.ts?
 */
export declare class ParagraphHandler implements HandlerInterface<BlockHandlerType> {
    lastLex: string;
    context?: DocProcContext;
    inlineFormatter: import("../types").InlineFormatterInterface;
    setContext(context: DocProcContext): void;
    getName(): string;
    canAccept(lexeme: string): boolean;
    buff: string;
    /**
     * Collects lexemes into a paragraph. If the leading lexemes are empty (e.g. all whitespace)
     * or is a newline, `DEFER` is returned to allow for a potentially better handler to pick up.
     *
     * One case to demonstrate where `DEFER` is useful:
     *
     * ```markdown
     * > paragraph1
     * > > paragraph 2
     * > paragraph 3
     * ```
     *
     * @param lexeme
     * @param def
     * @todo there's a minor bug with whitespace from next line being added on to previous element -- see the list.handler
     *       and blockquote.handler test cases with space before </>
     */
    push(lexeme: string, def?: LexemeDef): BlockActions;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): string;
}
