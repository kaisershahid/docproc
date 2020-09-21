import { HandlerManager } from "./handler-manager";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import {
  AfterPushStatus,
  DocContext,
  HandlerInterface,
  HandlerManagerInterface,
  LexemeConsumer,
  LEXEME_COMPLETE,
  LexerInterface,
  StateInterface,
  BlockHandlerType,
  InlineHandlerType,
} from "./types";

/**
 * Encapsulates management of lexer, parser, and all handlers.
 */
export class DocProcessor {
  protected lexer: LexerInterface;
  protected parser: StateInterface;
  protected context: DocContext;
  protected blocks: HandlerInterface<BlockHandlerType>[] = [];
  protected blockManager: HandlerManager<BlockHandlerType>;
  protected inlineManager: HandlerManager<InlineHandlerType>;

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

  getBlockManager(): HandlerManagerInterface<BlockHandlerType> {
    return this.blockManager;
  }

  getInlineManager(): HandlerManagerInterface<InlineHandlerType> {
    return this.inlineManager;
  }

  protected findNewHandler(lexeme: string) {
    const eligible: HandlerInterface<BlockHandlerType>[] = [];
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
    // @todo collect char/line info
    const collector: LexemeConsumer = (lexeme, def) => {
      if (lexeme === LEXEME_COMPLETE) {
        return;
      }

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
          // @todo include char/line
          throw new Error(
            `cannot find a default blockHandler. unable to process lexeme: ${lexeme} (${def})`
          );
        }
      }
    };
    this.lexer.reset().lex(content, collector);
    this.lexer.complete(collector);
    // @todo need state.finishDoc()
  }

  getString(): string {
    return "@todo";
  }
}
