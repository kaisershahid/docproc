import {
  HandlerInterface,
  InlineHandlerType,
  LexemeDef,
  InlineActions,
} from "../types";

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
