import { HandlerManager } from "./handler-manager";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import {
  BlockActions,
  DocContext,
  HandlerInterface,
  HandlerManagerInterface,
  LexemeConsumer,
  LEXEME_COMPLETE,
  LexerInterface,
  StateInterface,
  BlockHandlerType,
  InlineHandlerType,
  InlineFormatterInterface,
  LexemeDef,
  AnyMap,
} from "./types";
import { InlineStateBuffer } from "./inline/state-buffer";
import { ParagraphHandler } from "./defaults/paragraph-handler";

let id = 0;

/**
 * Encapsulates management of lexer, parser, and all handlers.
 */
export class DocProcessor {
  protected id: number;
  protected lexer: LexerInterface;
  protected parser: StateInterface;
  protected vars: AnyMap = {};
  protected context: DocContext;
  protected blocks: HandlerInterface<BlockHandlerType>[] = [];
  protected blockManager: HandlerManager<BlockHandlerType>;
  protected inlineManager: HandlerManager<InlineHandlerType>;
  protected collector: LexemeConsumer;
  protected curHandlerDefers = false;

  constructor(context?: DocContext | AnyMap) {
    this.id = ++id;
    const { lexer, parser, blockManager, inlineManager, vars } = context ?? {};
    this.lexer = lexer ?? new Lexer();
    this.parser = parser ?? new Parser();
    this.blockManager = blockManager ?? new HandlerManager();
    this.inlineManager = inlineManager ?? new HandlerManager();
    this.vars = vars ?? {};
    this.context = this.makeContext();
    this.blockManager.setContext(this.context);
    this.inlineManager.setContext(this.context);
    this.collector = this.makeCollector();
  }

  makeContext(): DocContext {
    const context = {
      lexer: this.lexer,
      state: this.parser,
      blockManager: this.blockManager,
      inlineManager: this.inlineManager,
      vars: this.vars,
      getInlineFormatter: (): InlineFormatterInterface => {
        return new InlineStateBuffer(context);
      },
    };

    return context;
  }

  protected makeCollector(): LexemeConsumer {
    // @todo collect char/line info
    // @todo if lexemes immediately after newline are whitespace, buffer first until first non-whitespace
    // @todo if line is blank or entirely whitespace, ignore
    return (lexeme, def) => {
      if (lexeme === LEXEME_COMPLETE) {
        return;
      }

      // previous lexeme signalled that if there's a better handler for current
      // lexeme to use that
      if (this.curHandlerDefers) {
        this.curHandlerDefers = false;
        let newHandler = this.findNewHandler(lexeme);
        if (
          newHandler.getName() != this.parser.getCurrentHandler()?.getName()
        ) {
          newHandler = newHandler.cloneInstance();
          newHandler.setContext(this.context);
          this.blocks.push(newHandler);
          this.parser.setCurrentHandler(newHandler);
        }
      }

      if (!this.parser.getCurrentHandler()) {
        this.setNewHandler(lexeme);
      }

      const result = this.parser.push(lexeme, def);
      if (result == BlockActions.DEFER) {
        this.curHandlerDefers = true;
      } else if (result == BlockActions.DONE) {
        this.parser.setCurrentHandler(undefined);
      } else if (result == BlockActions.REJECT) {
        this.parser.setCurrentHandler(undefined);
        this.setNewHandler(lexeme);
        if (this.parser.push(lexeme, def) === BlockActions.REJECT) {
          // @todo include char/line
          throw new Error(
            `cannot find a default blockHandler. unable to process lexeme: ${lexeme} (${def})`
          );
        }
      }
    };
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

  protected findNewHandler(lexeme: string): HandlerInterface<BlockHandlerType> {
    const eligible: HandlerInterface<BlockHandlerType>[] = [];
    this.blockManager.withHandlers((handlers) => {
      handlers.forEach((h) => {
        if (h.canAccept(lexeme)) {
          eligible.push(h);
        }
      });
    });

    return eligible[0]?.cloneInstance() ?? new ParagraphHandler();
  }

  protected setNewHandler(lexeme: string) {
    const contentBlock = this.findNewHandler(lexeme);
    contentBlock.setContext(this.context);
    this.blocks.push(contentBlock);
    this.parser.setCurrentHandler(contentBlock);
  }

  /**
   * For string-based construction, use this.
   * @param content
   */
  process(content: string) {
    this.lexer.reset().lex(content, this.collector);
    this.lexer.complete(this.collector);
    // @todo need state.finishDoc()
  }

  /**
   * For stream-based construction, use this.
   * @param lex
   * @param def
   */
  push(lex: string, def?: LexemeDef) {
    this.collector(lex, def);
  }

  toString(): string {
    return this.blocks.join("\n");
  }
}
