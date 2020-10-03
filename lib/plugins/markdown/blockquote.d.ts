import { BlockHandlerType, HandlerInterface } from "../../types";
import { BlockNestableBase } from "../../defaults/block-nestable-base";
/**
 * Supports blockquotes with `>`:
 *
 * ```markdown
 * > paragraph
 * >> nested blockquote paragraph
 * >>> \`\`\`
 * >>> nested code
 * >>> 2 levels deep
 * >>> \`\`\`
 * ```
 *
 * Note that there are no limits to syntax support -- the entire structure
 * is handled within a blockquote.
 */
export declare class BlockquoteHandler extends BlockNestableBase implements HandlerInterface<BlockHandlerType> {
    getName(): string;
    canAccept(lexeme: string): boolean;
    isLexemeIndented(lexeme: string): boolean;
    getUnindentedLexeme(lexeme: string): string;
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    toString(): string;
}
