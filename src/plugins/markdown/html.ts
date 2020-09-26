// @todo html handler that allows block-level elements (div, blockquote, table, p, aside, header, nav, dl)

import { BlockBase } from "../../defaults/block-base";
import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
} from "../../types";
import { REGEX_HTML_TAG_UNVALIDATED_START_OPEN } from "./lexdef.lookaheads";

export enum EnclosingTagState {
  start,
  tag_starting,
  tag_open,
  tag_closing,
  tag_closed,
}

export class HtmlBlockHandler
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  canAccept(lexeme: string, def: LexemeDef | undefined): boolean {
    return REGEX_HTML_TAG_UNVALIDATED_START_OPEN.test(lexeme);
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new HtmlBlockHandler();
  }

  getName(): string {
    return "html-block";
  }

  handlerEnd(): void {}

  lastLex = "";
  state: EnclosingTagState = EnclosingTagState.start;
  buff: any[] = [];

  push(lexeme: string, def: LexemeDef | undefined): any {
    let ret = BlockActions.REJECT;
    switch (this.state) {
      case EnclosingTagState.start:
        ret = this.handleStart(lexeme, def);
        break;
      case EnclosingTagState.tag_starting:
        ret = this.handleTagStarting(lexeme, def);
        break;
      case EnclosingTagState.tag_open:
        ret = this.handleTagOpen(lexeme, def);
        break;
      case EnclosingTagState.tag_closing:
        ret = this.handleTagClosing(lexeme, def);
        break;
      case EnclosingTagState.tag_closed:
        ret = this.handleTagClosed(lexeme, def);
        break;
    }

    this.lastLex = lexeme;
    return ret;
  }

  tagCloseStart = "";

  private handleStart(
    lexeme: string,
    def: LexemeDef | undefined
  ): BlockActions {
    // @todo verify lexeme as tag open?
    this.buff.push(lexeme);
    this.tagCloseStart = "</" + lexeme.substr(1);
    this.state = EnclosingTagState.tag_starting;
    return BlockActions.CONTINUE;
  }

  private handleTagStarting(
    lexeme: string,
    def: LexemeDef | undefined
  ): BlockActions {
    this.buff.push(lexeme);
    if (lexeme == ">") {
      this.state = EnclosingTagState.tag_open;
      // for now, we're treating everything between open and close as a single block
      this.buff.push(this.inlineFormatter);
    }
    return BlockActions.CONTINUE;
  }

  private handleTagOpen(
    lexeme: string,
    def: LexemeDef | undefined
  ): BlockActions {
    if (lexeme === this.tagCloseStart) {
      this.buff.push(lexeme);
      this.state = EnclosingTagState.tag_closing;
    } else {
      this.inlineFormatter.push(lexeme, def);
    }
    return BlockActions.CONTINUE;
  }

  private handleTagClosing(
    lexeme: string,
    def: LexemeDef | undefined
  ): BlockActions {
    if (lexeme == ">") {
      this.state = EnclosingTagState.tag_closed;
      this.buff.push(lexeme);
      return BlockActions.DONE;
    }

    return BlockActions.REJECT;
  }

  private handleTagClosed(
    lexeme: string,
    def: LexemeDef | undefined
  ): BlockActions {
    return BlockActions.REJECT;
  }

  toString() {
    return this.buff.join("");
  }
}
