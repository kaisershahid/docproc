import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import { BlockBase } from "../../defaults/block-base";
import { REGEX_HORIZONTAL_RULE } from "./lexdef.lookaheads";

/**
 * Handle horizontal rules.
 */
export class HorizontalRuleHandler extends BlockBase {
  getName() {
    return "horizontal-rule";
  }

  canAccept(lexeme: string, def?: LexemeDef) {
    return REGEX_HORIZONTAL_RULE.test(lexeme);
  }

  rule: string[] = [];
  lastLex = "";

  push(lexeme: string, def?: LexemeDef): BlockActions {
    if (REGEX_HORIZONTAL_RULE.test(lexeme)) {
      this.pushLine();
    } else if (isLineEnd(this.lastLex)) {
      // line start, but not hrule start
      return BlockActions.REJECT;
    } else if (isLineEnd(lexeme) && isLineEnd(this.lastLex)) {
      return BlockActions.DONE;
    }

    this.lastLex = lexeme;
    return BlockActions.CONTINUE;
  }

  protected pushLine() {
    if (this.lastLex === "" || isLineEnd(this.lastLex)) {
      this.rule.push("<hr />");
    }
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new HorizontalRuleHandler();
  }

  toString() {
    return this.rule.join("\n");
  }
}
