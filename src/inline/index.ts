import { HandlerInterface, InlineHandlerType, LexemeDef } from "../types";

export enum InlineActions {
  /**
   * If a specific handler is registered for a lexeme, use that instead of current one
   * if available (otherwise, continue using current handler).
   */
  DEFER,
  /**
   * Subsequent lexemes will be given to this handler until it finds a closing lexeme.
   */
  NEST,
  /**
   * Continue accepting lexemes.
   */
  CONTINUE,
  /**
   * Closing lexeme encountered and consumed. Take current handler off stack.
   */
  POP,
  /**
   * Lexeme not accepted. Take current handler off stack and retry with parent.
   */
  REJECT,
}

export interface InlineHandlerInterface
  extends HandlerInterface<InlineHandlerType> {
  /**
   * Checks what the current handler wants to do with the lexeme. This allows complex handlers
   * to have better lifecycle control. The 3 values that should be returned are:
   *
   * - `CONTINUE`: don't try to find a new handler
   * - `DEFER`: try to find a new handler, if found, defer to that
   * - `REJECT`: handler is done; retry lexeme with parent handler
   *
   * @param lexeme
   */
  nextAction: (lexeme: string) => InlineActions;
  setParent: (parent: InlineHandlerInterface) => InlineHandlerInterface;
  getParent: () => InlineHandlerInterface | null;
  addChild: (
    child: HandlerInterface<InlineHandlerType>
  ) => InlineHandlerInterface;
  getChildren: () => InlineHandlerInterface[];
}
