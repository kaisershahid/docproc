import {
  BlockActions,
  BlockHandlerType,
  ContextAwareInterface,
  DocProcContext,
  HandlerInterface,
  InlineFormatterDummy,
  InlineFormatterInterface,
  LexemeDef,
} from "../types";
import { NAME_DEFAULT } from "../handler-manager";
import { isLineEnd, isWhitespace, trimString } from "../utils";

export class BlockBase implements ContextAwareInterface {
  protected context?: DocProcContext;
  protected inlineFormatter: InlineFormatterInterface = InlineFormatterDummy;

  setContext(context: DocProcContext) {
    this.context = context;
    this.inlineFormatter = context.getInlineFormatter();
  }
}

export class BlockEmptyHandler
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  getName(): string {
    throw new Error("getName() not defined");
  }

  canAccept(lexeme: string, def?: LexemeDef): boolean {
    throw new Error("canAccept() not defined");
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    throw new Error("push() not defined");
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    throw new Error("cloneInstance() not defined");
  }

  toString() {
    throw new Error("toString() not defined");
  }
}
