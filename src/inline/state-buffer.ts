import { InlineHandlerInterface } from "./index";
import {
  DocProcContext,
  HandlerInterface,
  HandlerManagerInterface,
  InlineActions,
  InlineFormatterInterface,
  InlineHandlerType,
  LexemeDef,
  TypedMap,
} from "../types";
import { DefaultParentHandler } from "./handlers/default-parent";

export const actionShouldUseNewHandler = (action: InlineActions) =>
  action == InlineActions.DEFER || action == InlineActions.REJECT;
export const actionIsDeferred = (action: InlineActions) =>
  action == InlineActions.DEFER;

/**
 * Collects lexemes into a properly nested structure of handlers and words.
 */
export class InlineStateBuffer implements InlineFormatterInterface {
  protected manager: HandlerManagerInterface<InlineHandlerType>;
  protected defaultHandler: DefaultParentHandler;
  protected stack: HandlerInterface<InlineHandlerType>[] = [];
  protected handlersByLex: TypedMap<InlineHandlerInterface> = {};
  protected context: DocProcContext;

  constructor(context: DocProcContext) {
    this.context = context;
    this.manager = context.inlineManager;
    this.defaultHandler = new DefaultParentHandler();
    this.defaultHandler.setContext(context);
    this.stack.push(this.defaultHandler);
  }

  push(lex: string, def?: LexemeDef) {
    let cur = this.stack[0] as InlineHandlerInterface;
    if (cur === this.defaultHandler) {
      // at the root level
      if (!this.wasNewHandlerFoundAndPushedForLex(lex, def)) {
        cur.push(lex);
      }
    } else {
      // 1+ levels deep
      let action = cur.nextAction(lex);
      if (actionShouldUseNewHandler(action)) {
        if (!actionIsDeferred(action)) {
          this.stack.shift();
          cur = this.stack[0] as InlineHandlerInterface;
        }

        if (this.wasNewHandlerFoundAndPushedForLex(lex, def)) {
          return;
        }
      }

      action = cur.push(lex, def);
      switch (action) {
        case InlineActions.POP:
          this.stack.shift();
          break;
        case InlineActions.REJECT:
          this.stack.shift();
          this.push(lex, def);
          break;
      }
    }
  }

  /**
   * Attempt to find a new handler for the lexeme. If found, push to stack and return true.
   * Otherwise, return false.
   * @param lex
   * @param def
   * @protected
   */
  protected wasNewHandlerFoundAndPushedForLex(
    lex: string,
    def?: LexemeDef
  ): boolean {
    let newHandler = this.findHandler(lex);
    if (newHandler) {
      newHandler = newHandler.cloneInstance();
      newHandler.setContext(this.context);
      newHandler.push(lex);
      // @todo only push to stack if push() returns NEST
      (this.stack[0] as InlineHandlerInterface).addChild(newHandler);
      this.stack.unshift(newHandler);
      return true;
    }

    return false;
  }

  findHandler(lex: string): HandlerInterface<InlineHandlerType> | null {
    if (this.handlersByLex[lex] !== undefined) {
      return this.handlersByLex[lex];
    }

    let rankedHandlers: InlineHandlerInterface[] = [];
    this.manager.withHandlers((handlers) => {
      rankedHandlers = <InlineHandlerInterface[]>(
        handlers.filter((h) => h.canAccept(lex))
      );
    });

    return (this.handlersByLex[lex] = rankedHandlers[0] ?? null);
  }

  toString() {
    return this.defaultHandler.toString();
  }
}
