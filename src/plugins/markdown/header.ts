import {
  BlockActions,
  BlockHandlerType,
  DocProcContext,
  HandlerInterface,
  InlineFormatterInterface,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import { BlockBase } from "../../defaults/block-base";

export const REGEX_HEADER_START = /^#{1,6}/;

export class Header {
  level: number;
  formatter: InlineFormatterInterface;

  constructor(level: number, context: DocProcContext) {
    // @todo use context to register this header for TOC (through some dispatching mechanism)
    this.level = level;
    this.formatter = context.getInlineFormatter();
  }

  push(lexeme: string, def?: LexemeDef) {
    this.formatter.push(lexeme, def);
  }

  toString() {
    return `<h${this.level}>${this.formatter.toString()}</h${this.level}>`;
  }
}

/**
 * Handle headers <h1/> ... <h6/>
 */
export class HeaderHandler extends BlockBase {
  getName() {
    return "header";
  }

  canAccept(lexeme: string, def?: LexemeDef) {
    return REGEX_HEADER_START.test(lexeme);
  }

  lastLex = "";
  headers: Header[] = [];

  curHeader(): Header {
    const idx = this.headers.length - 1;
    const header = this.headers[idx];
    if (!header) {
      throw new Error("no current header");
    }
    return header;
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    const lastLineEnd = isLineEnd(this.lastLex);
    const lastLex = this.lastLex;
    this.lastLex = lexeme;
    if (REGEX_HEADER_START.test(lexeme)) {
      return this.pushHeaderStart(lexeme, lastLex);
    } else if (lastLineEnd) {
      if (isLineEnd(lexeme)) {
        return BlockActions.DONE;
      }
      return BlockActions.REJECT;
    } else if (!isLineEnd(lexeme)) {
      this.curHeader().push(lexeme, def);
      return BlockActions.CONTINUE;
    }

    return BlockActions.CONTINUE;
  }

  protected pushHeaderStart(lexeme: string, lastLex: string): BlockActions {
    if (lastLex == "" || isLineEnd(lastLex)) {
      const level = lexeme.length;
      this.headers.push(new Header(level, this.context as DocProcContext));
    }

    return BlockActions.CONTINUE;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new HeaderHandler();
  }

  toString() {
    return this.headers.join("\n");
  }
}
