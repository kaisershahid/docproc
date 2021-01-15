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
export class BlockquoteHandler
	extends BlockNestableBase
	implements HandlerInterface<BlockHandlerType> {
	getName() {
		return "blockquote";
	}

	canAccept(lexeme: string) {
		return lexeme[0] == ">";
	}

	isLexemeIndented(lexeme: string): boolean {
		return lexeme[0] == ">";
	}

	getUnindentedLexeme(lexeme: string): string {
		return lexeme.substr(1).replace(/^\s+/, "");
	}

	cloneInstance(): HandlerInterface<BlockHandlerType> {
		return new BlockquoteHandler();
	}

	toString() {
		return "<blockquote>" + this.getSubDoc().getString() + "</blockquote>";
	}
}
