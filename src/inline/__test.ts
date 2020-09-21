import { BaseHandler } from "./handlers/base";
import { HandlerInterface, InlineHandlerType, LexemeDef } from "../types";
import { InlineActions } from "./index";

export class TestInlineHandler extends BaseHandler {
  handleLex: string;
  startTag: string;
  endTag: string;

  constructor(handleLex: string, startTag: string, endTag: string) {
    super();
    this.handleLex = handleLex;
    this.startTag = startTag;
    this.endTag = endTag;
  }

  inTag = false;
  closed = false;
  canAccept(lexeme: string): boolean {
    return this.handleLex == lexeme;
  }

  nextAction(lexeme: string): InlineActions {
    if (this.closed) {
      return InlineActions.REJECT;
    }

    if (this.inTag && this.handleLex == lexeme) {
      return InlineActions.CONTINUE;
    }

    return InlineActions.DEFER;
  }

  push(lexeme: string, def: LexemeDef | undefined): any {
    if (lexeme == this.handleLex) {
      if (this.inTag) {
        this.closed = true;
        return InlineActions.POP;
      }

      this.inTag = true;
      return InlineActions.NEST;
    } else if (this.inTag) {
      this.words.push(lexeme);
      return InlineActions.CONTINUE;
    }
  }

  toString() {
    return `${this.startTag}${this.words.join("")}${this.endTag}`;
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    const clone = new TestInlineHandler(
      this.handleLex,
      this.startTag,
      this.endTag
    );
    return clone;
  }
}
