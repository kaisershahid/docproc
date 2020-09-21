import { HandlerInterface, InlineHandlerType, LexemeDef } from "../../types";
import { BaseHandler } from "./base";
import { InlineActions } from "../index";
import { returnUnescapedString, translateEscapedString } from "../../utils";

/**
 * Generic inline formatter that wraps text with matching opening/closing lexemes. Suitable
 * for things like `**`, `*`, `\``, etc.
 */
export class SimpleWrapHandler extends BaseHandler {
  handleLex: string;
  startTag: string;
  endTag: string;

  constructor(handleLex: string, startTag: string, endTag: string) {
    super();
    this.handleLex = handleLex;
    this.startTag = startTag;
    this.endTag = endTag;
  }

  lastLexEscaped = false;
  inTag = false;
  closed = false;

  canAccept(lexeme: string): boolean {
    return this.handleLex == lexeme;
  }

  nextAction(lexeme: string): InlineActions {
    if (this.closed) {
      return InlineActions.REJECT;
    }

    if (this.inTag && (lexeme[0] == "\\" || this.handleLex == lexeme)) {
      return InlineActions.CONTINUE;
    }

    return InlineActions.DEFER;
  }

  push(lexeme: string, def: LexemeDef | undefined): any {
    if (lexeme == this.handleLex && !this.lastLexEscaped) {
      if (this.inTag) {
        this.closed = true;
        return InlineActions.POP;
      }

      this.inTag = true;
      return InlineActions.NEST;
    } else if (this.inTag) {
      this.words.push(returnUnescapedString(lexeme));
      return InlineActions.CONTINUE;
    }
  }

  toString() {
    return `${this.startTag}${this.words.join("")}${this.endTag}`;
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new SimpleWrapHandler(this.handleLex, this.startTag, this.endTag);
  }
}
