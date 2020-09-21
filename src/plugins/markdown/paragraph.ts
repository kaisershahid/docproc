import {
  AfterPushStatus,
  DocContext,
  HandlerInterface,
  LexemeConsumer,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";

export class ParagraphBlockHandler implements HandlerInterface {
  words: string[] = [];
  context?: DocContext;
  lastLex: string = "";

  getName() {
    return "default";
  }

  canAccept(lexeme: string) {
    return true;
  }

  push(lexeme: string, def?: LexemeDef): AfterPushStatus {
    // @todo handle escape chars (make look-ahead to differentiate between translate ("\\n" -> "\n") and escape at end of line ("\\\n")
    if (isLineEnd(lexeme) && isLineEnd(this.lastLex))
      return AfterPushStatus.DONE;

    this.lastLex = lexeme;
    this.words.push(isLineEnd(lexeme) ? " " : lexeme);
    return AfterPushStatus.CONTINUE;
  }

  cloneInstance(): HandlerInterface {
    const clone = new ParagraphBlockHandler();
    return clone;
  }

  setContext(context: DocContext) {
    this.context = context;
  }

  toString() {
    return this.words.join("");
  }
}
