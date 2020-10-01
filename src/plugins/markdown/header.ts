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
export const HEADER_DATA_CATEGORY = "header";
export type HeaderItem = {
  id: string;
  content: string;
  level: number;
};

export class Header {
  idx: number;
  id = "";
  content = "";
  level: number;
  formatter: InlineFormatterInterface;

  /**
   *
   * @param level
   * @param context
   * @param idx suffix to ensure uniqueness for same-content headers
   */
  constructor(level: number, context: DocProcContext, idx: number) {
    this.idx = idx;
    this.level = level;
    this.formatter = context.getInlineFormatter();
  }

  push(lexeme: string, def?: LexemeDef) {
    this.formatter.push(lexeme, def);
  }

  getId(): string {
    if (this.id !== "") {
      return this.id;
    }

    this.content = this.formatter.toString();
    let norm = this.content.replace(/[^\w-]/, "").toLowerCase();
    this.id = `${norm}-${this.idx}`;
    return this.id;
  }

  toString() {
    const id = this.getId();
    return `<h${this.level} id="${id}">${this.content}</h${this.level}>`;
  }

  getItem(): HeaderItem {
    return {
      id: this.getId(),
      content: this.content,
      level: this.level,
    };
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
  isClosed = false;

  curHeader(): Header {
    const idx = this.headers.length - 1;
    const header = this.headers[idx];
    if (!header) {
      throw new Error("no current header");
    }
    return header;
  }

  handlerEnd() {
    if (this.isClosed) {
      return;
    }

    this.isClosed = true;
    const item = this.curHeader().getItem();
    this.context?.dataRegistry.addItem(HEADER_DATA_CATEGORY, item);
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
    } else {
      this.handlerEnd();
    }

    return BlockActions.CONTINUE;
  }

  protected pushHeaderStart(lexeme: string, lastLex: string): BlockActions {
    if (lastLex == "" || isLineEnd(lastLex)) {
      const level = lexeme.length;
      const context = this.context as DocProcContext;
      this.isClosed = false;
      this.headers.push(
        new Header(
          level,
          context,
          context.dataRegistry.count(HEADER_DATA_CATEGORY) + 1
        )
      );
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
