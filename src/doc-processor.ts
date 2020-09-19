import { HandlerManager } from "./handler-manager";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import {
	AfterPushStatus,
	DocContext,
	HandlerInterface,
	HandlerManagerInterface,
	LexerInterface,
	StateInterface,
} from "./types";

/**
 * Encapsulates management of lexer, parser, and all handlers.
 */
export class DocProcessor {
	protected lexer: LexerInterface;
	protected parser: StateInterface;
	protected context: DocContext;
	protected blocks: HandlerInterface[] = [];
	protected blockManager: HandlerManager;
	protected inlineManager: HandlerManager;

	constructor() {
		this.lexer = new Lexer();
		this.parser = new Parser();
		this.context = { lexer: this.lexer, state: this.parser };
		this.blockManager = new HandlerManager();
		this.blockManager.setContext(this.context);
		this.inlineManager = new HandlerManager();
		this.inlineManager.setContext(this.context);
	}

	getLexer(): LexerInterface {
		return this.lexer;
	}

	getBlockManager(): HandlerManagerInterface {
		return this.blockManager;
	}

	getInlineManager(): HandlerManagerInterface {
		return this.inlineManager;
	}

	protected findNewHandler(lexeme: string) {
		const eligible: HandlerInterface[] = [];
		this.blockManager.withHandlers((handlers) => {
			handlers.forEach((h) => {
				if (h.canAccept(lexeme)) {
					eligible.push(h);
				}
			});
		});

		// @todo need default?
		const contentBlock = eligible[0].cloneInstance();
		contentBlock.setContext(this.context);
		this.blocks.push(contentBlock);
		this.parser.setCurrentHandler(contentBlock);
	}

	process(content: string) {
		this.lexer.lex(content, (lexeme, def) => {
			if (!this.parser.getCurrentHandler()) {
				this.findNewHandler(lexeme);
			}

			const result = this.parser.push(lexeme, def);
			if (result == AfterPushStatus.DONE) {
				this.parser.setCurrentHandler(undefined);
			} else if (result == AfterPushStatus.REJECT) {
				this.parser.setCurrentHandler(undefined);
				this.findNewHandler(lexeme);
				if (this.parser.push(lexeme, def) === AfterPushStatus.REJECT) {
					throw new Error(
						`unable to process lexeme: ${lexeme} (${def})`
					);
				}
			}
		});

		// @todo need state.finishDoc()
	}

	getString(): string {
		return "@todo";
	}
}
