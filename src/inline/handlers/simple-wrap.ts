import {
  HandlerInterface,
  InlineActions,
  InlineHandlerType,
  LexemeDef,
} from "../../types";
import { BaseHandler } from "./base";
import { returnUnescapedString } from "../../utils";

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

  getName(): string {
    return `simple-wrap-${this.handleLex}`;
  }

  lastLex = "";
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

  isEnclosingLex(lexeme: string, def?: LexemeDef): boolean {
    return lexeme == this.handleLex && !this.lastLexEscaped;
  }

  /**
   * If the enclosing tag is encountered (and not escaped), defer control to this method.
   * This is used to signal opening and closing of tag
   * @param lexeme
   * @param def
   * @protected
   */
  protected handleEnclosingLex(lexeme: string, def?: LexemeDef): InlineActions {
    if (this.closed) {
      return InlineActions.REJECT;
    }

    if (this.inTag) {
      this.inTag = false;
      this.closed = true;
      return InlineActions.POP;
    }

    this.inTag = true;
    return InlineActions.NEST;
  }

  /**
   * If enclosing tag is not encountered but we're inTag, defer control to this method.
   * @param lexeme
   * @param def
   * @protected
   */
  protected handlePush(lexeme: string, def?: LexemeDef): InlineActions {
    this.words.push(returnUnescapedString(lexeme));
    return InlineActions.CONTINUE;
  }

  /**
   * If enclosing tag is not encountered but we're closed, defer control to this method.
   * Note that this is the least likely method to override.
   * @param lexeme
   * @param def
   * @protected
   */
  protected handleClose(lexeme: string, def?: LexemeDef): InlineActions {
    return InlineActions.REJECT;
  }

  push(lexeme: string, def?: LexemeDef | undefined): any {
    let ret = InlineActions.REJECT;
    if (this.isEnclosingLex(lexeme, def)) {
      ret = this.handleEnclosingLex(lexeme, def);
    } else if (this.inTag) {
      if (lexeme == "\\") {
        ret = InlineActions.CONTINUE;
      } else {
        ret = this.handlePush(lexeme, def);
      }
    } else if (this.closed) {
      ret = this.handleClose(lexeme, def);
    }

    this.lastLexEscaped = lexeme == "\\";
    this.lastLex = lexeme;
    return ret;
  }

  toString() {
    return `${this.startTag}${this.words.join("")}${this.endTag}`;
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new SimpleWrapHandler(this.handleLex, this.startTag, this.endTag);
  }
}
