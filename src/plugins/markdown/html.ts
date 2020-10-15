// @todo html handler that allows block-level elements (div, blockquote, table, p, aside, header, nav, dl)

import { BlockBase } from "../../defaults/block-base";
import {
  AnyMap,
  BlockActions,
  BlockHandlerType,
  DocProcContext,
  HandlerInterface,
  LexemeConsumer,
  LexemeDef,
} from "../../types";
import { REGEX_HTML_TAG_UNVALIDATED_START_OPEN } from "./lexdef.lookaheads";
import { DocProcessor } from "../../doc-processor";

/**
 * Only these tags enable the HTMLBlockHandler.
 */
const BlockTags: AnyMap = {
  div: "div",
  p: "p",
  blockquote: "blockquote",
  table: "table",
  aside: "aside",
  header: "header",
  footer: "footer",
  nav: "nav",
  body: "body",
  style: "style",
  script: "script",
  head: "head",
};

/**
 * The body of these tags should not be touched by the inline formatter.
 */
const LiteralBodyTags: AnyMap = {
  head: "head",
  style: "style",
  script: "script",
};

/**
 * A type of block tag that supports full Markdown parsing within its body.
 */
const ContainerTags: AnyMap = {
  div: "div",
  body: "body",
};

export enum EnclosingTagState {
  start,
  tag_starting,
  tag_open,
  tag_closing,
  tag_closed,
}

/**
 * Detects and treats specific HTML tags as block elements, such that all content within the same tag is treated as a
 * single block, with some caveats:
 *
 * - For tags in {@see LiteralBodyTags} like `<style/>`, tag content is passed through
 * - For tags in {@see ContainerTags} like `<body/>`, content is treated as a sub-document, so that markdown block
 *   processing continues to apply
 * - otherwise, content is treated like inline text.
 */
export class HtmlBlockHandler
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  pusher: LexemeConsumer;
  closer: () => void;

  constructor() {
    super();
    this.pusher = (lex, def) => {
      this.buff.push(lex);
    };
    this.closer = () => {};
  }

  /**
   * Only handle tags defined in BlockTags.
   * @param lexeme
   * @param def
   */
  canAccept(lexeme: string, def: LexemeDef | undefined): boolean {
    return (
      REGEX_HTML_TAG_UNVALIDATED_START_OPEN.test(lexeme) &&
      BlockTags[lexeme.substr(1).toLowerCase()]
    );
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

  isContainer = false;
  tagName = "";
  tagOpenStart = "";
  tagCloseStart = "";
  // for container tags, ensure content containing same-name tags have a matching close to avoid premature close of container
  tagsOpen = 0;

  private handleStart(
    lexeme: string,
    def: LexemeDef | undefined
  ): BlockActions {
    // @todo verify lexeme as tag open?
    this.buff.push(lexeme);
    this.tagName = lexeme.substr(1).toLowerCase();
    this.tagOpenStart = "<" + this.tagName;
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
      if (ContainerTags[this.tagName] !== undefined) {
        this.setToContainerPush();
      } else if (LiteralBodyTags[this.tagName] !== undefined) {
        this.setToPassthroughPush();
      } else {
        this.setToInlinePush();
      }
    }
    return BlockActions.CONTINUE;
  }

  protected setToContainerPush() {
    const docproc = new DocProcessor(this.context as DocProcContext);
    this.pusher = (lexeme: string, def?: LexemeDef): any => {
      docproc.push(lexeme, def);
    };
    this.closer = () => {
      docproc.complete();
    };
    this.buff.push(docproc);
  }

  protected setToPassthroughPush() {
    this.pusher = (lexeme: string, def?: LexemeDef): any => {
      this.buff.push(lexeme);
    };
  }

  protected setToInlinePush() {
    this.pusher = (lexeme: string, def?: LexemeDef): any => {
      this.inlineFormatter.push(lexeme, def);
    };
    this.buff.push(this.inlineFormatter);
  }

  private handleTagOpen(
    lexeme: string,
    def: LexemeDef | undefined
  ): BlockActions {
    if (lexeme === this.tagCloseStart) {
      if (this.tagsOpen == 0) {
        this.buff.push(lexeme);
        this.state = EnclosingTagState.tag_closing;
      } else {
        this.pusher(lexeme, def);
        this.tagsOpen--;
      }
    } else {
      if (lexeme.toLowerCase() == this.tagOpenStart) {
        this.tagsOpen++;
      }
      this.pusher(lexeme, def);
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
