import { SimpleWrapHandler } from "../../../inline/handlers/simple-wrap";
import { InlineActions } from "../../../types";

export class CodeHandler extends SimpleWrapHandler {
  constructor() {
    super("`", "<code>", "</code>");
  }

  nextAction(lexeme: string): InlineActions {
    const nextAction = super.nextAction(lexeme);
    return nextAction == InlineActions.DEFER
      ? InlineActions.CONTINUE
      : nextAction;
  }
}
