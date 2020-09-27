import { BaseHandler } from "../../../inline/handlers/base";
import {
  HandlerInterface,
  InlineActions,
  InlineHandlerType,
  LexemeDef,
} from "../../../types";
import {
  REGEX_HTML_TAG_UNVALIDATED_START_CLOSE,
  REGEX_HTML_TAG_UNVALIDATED_START_OPEN,
} from "../lexdef.lookaheads";

export enum HtmlTagState {
  start,
  tag_start,
  tag_open,
  tag_closing,
  tag_closed,
}

/**
 * Properly follows state of tag tokens to only apply embedded formatting to the tag.
 * Currently expects attribute values to be properly encoded (more specifically, `>`
 * literal shouldn't be in there).
 */
export class HtmlTagHandler extends BaseHandler {
  nextAction(lexeme: string): InlineActions {
    if (this.state == HtmlTagState.tag_closed) return InlineActions.REJECT;
    else if (this.state == HtmlTagState.tag_open) return InlineActions.DEFER;
    else return InlineActions.CONTINUE;
  }

  canAccept(lexeme: string): boolean {
    return REGEX_HTML_TAG_UNVALIDATED_START_OPEN.test(lexeme);
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new HtmlTagHandler();
  }

  getName(): string {
    return "html-tag";
  }

  state = HtmlTagState.start;
  lastLex = "";
  lastLexEsc = false;
  tagName = "";

  push(lexeme: string, def: LexemeDef | undefined): any {
    let ret = InlineActions.REJECT;
    switch (this.state) {
      case HtmlTagState.start:
        ret = this.handleStart(lexeme, def);
        break;
      case HtmlTagState.tag_start:
        ret = this.handleTagStart(lexeme, def);
        break;
      case HtmlTagState.tag_open:
        ret = this.handleTagOpen(lexeme, def);
        break;
      case HtmlTagState.tag_closing:
        ret = this.handleTagClosing(lexeme, def);
        break;
      case HtmlTagState.tag_closed:
        ret = this.handleTagClosed(lexeme, def);
        break;
    }

    this.lastLex = lexeme;
    this.lastLexEsc = lexeme == "\\";
    return ret;
  }

  toString() {
    return this.words.join("");
  }

  /**
   * Returns true if '/>' is found in lexeme.
   * @param lexeme
   */
  isInlineTagEnd(lexeme: string) {
    return lexeme.indexOf("/>") > -1;
  }

  isTagStartDone(lexeme: string) {
    return lexeme.indexOf(">") > -1;
  }

  private handleStart(
    lexeme: string,
    def: LexemeDef | undefined
  ): InlineActions {
    if (REGEX_HTML_TAG_UNVALIDATED_START_OPEN.test(lexeme)) {
      this.tagName = lexeme.substr(1);
      this.words.push(lexeme);
      this.state = HtmlTagState.tag_start;
      return InlineActions.NEST;
    }

    return InlineActions.REJECT;
  }

  private handleTagStart(
    lexeme: string,
    def: LexemeDef | undefined
  ): InlineActions {
    this.words.push(lexeme);
    if (this.isInlineTagEnd(lexeme)) {
      this.state = HtmlTagState.tag_closed;
      return InlineActions.POP;
    } else if (this.isTagStartDone(lexeme)) {
      this.state = HtmlTagState.tag_open;
      return InlineActions.DEFER;
    }
    return InlineActions.CONTINUE;
  }

  private handleTagOpen(
    lexeme: string,
    def: LexemeDef | undefined
  ): InlineActions {
    this.words.push(lexeme);
    if (
      REGEX_HTML_TAG_UNVALIDATED_START_CLOSE.test(lexeme) &&
      this.tagName == lexeme.substr(2)
    ) {
      this.state = HtmlTagState.tag_closing;
      return InlineActions.CONTINUE;
    }

    return InlineActions.DEFER;
  }

  private handleTagClosing(
    lexeme: string,
    def: LexemeDef | undefined
  ): InlineActions {
    if (lexeme !== ">") {
      return InlineActions.REJECT;
    }
    this.words.push(lexeme);
    this.state = HtmlTagState.tag_closed;
    return InlineActions.POP;
  }

  private handleTagClosed(
    lexeme: string,
    def: LexemeDef | undefined
  ): InlineActions {
    return InlineActions.REJECT;
  }
}
