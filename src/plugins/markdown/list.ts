import { BlockNestableBase } from "../../defaults/block-nestable-base";
import {
  BlockActions,
  BlockHandlerType,
  DocContext,
  HandlerInterface,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import {
  LEXEME_TYPE_LIST_ITEM_START,
  startingWhitespaceLookahead,
} from "./lexdef.lookaheads";
import { DocProcessor } from "../../doc-processor";

const REGEX_CHECK_INDENT = /^(\s*)(\d+.|-|\*)/;

export class ListItemContainer {
  context: DocContext;
  id: number;
  subDoc: DocProcessor;
  constructor(context: DocContext, containerId: number) {
    this.context = context;
    this.id = containerId;
    this.subDoc = new DocProcessor(context);
  }

  push(lexeme: string, def?: LexemeDef) {
    // console.log(this.id, "sub.push", { lexeme, def });
    this.subDoc.push(lexeme, def);
  }

  toString() {
    return `<li>${this.subDoc.toString()}</li>`;
  }
}

/**
 * Supports the following list item styles:
 *
 * - `1. list item`
 * - `1) list item`
 * - `* list item`
 * - `- list item`
 *
 * Note that indenting by at least the length of the starting line's delimiter
 * will support full markdown syntax:
 *
 * ```markdown
 * - item 1
 *   ** item continued**
 *   > you can do a blockquote!
 *   - subitem
 *     > blockquote under subitem
 *     |maybe|a   |table
 *     |---  |--- |---
 *     |while|ur  |at it
 *
 * 1. ordered item
 *    similar thing
 * ```
 *
 */
export class ListHandler extends BlockNestableBase {
  static getListStyle(listStart: string): string {
    return listStart[0] == "*" || listStart[0] == "-" ? "ul" : "ol";
  }

  getName(): string {
    return "list";
  }

  listStyle = "";
  indents: { ws: string; depth: number }[] = [];
  lastIndent: { ws: string; depth: number } = { ws: "", depth: -1 };
  items: ListItemContainer[] = [];
  curItem?: ListItemContainer;

  canAccept(lexeme: string, def?: LexemeDef): boolean {
    return def?.type == LEXEME_TYPE_LIST_ITEM_START;
  }

  isItemStart(lexeme: string, def?: LexemeDef): boolean {
    return def?.type == LEXEME_TYPE_LIST_ITEM_START;
  }

  /**
   * Does this line match the indent of the last line
   * @param lexeme
   */
  isLineIndented(lexeme: string): boolean {
    const lastWs = this.lastIndent.ws;
    const lexWs = lexeme.substr(0, lastWs.length);
    if (lexWs === lastWs) {
      return true;
    }

    return false;
  }

  protected inItem = false;
  protected detectNewLine = false;

  /**
   * @param lexeme
   * @param def
   */
  push(lexeme: string, def?: LexemeDef): BlockActions {
    if (this.isItemStart(lexeme, def)) {
      this.detectNewLine = false;
      const listStyle = ListHandler.getListStyle(lexeme.replace(/^\s*/, ""));

      // different list styles, so terminate this
      // @todo doublecheck this is good logic
      if (this.listStyle != "" && this.listStyle != listStyle) {
        return BlockActions.REJECT;
      }

      const depth = lexeme.length;
      const tmp = startingWhitespaceLookahead(lexeme, lexeme, 1);
      const ws = tmp?.newLexeme ?? "";
      this.listStyle = listStyle;

      // if this is a child, the remainder after indent will be pushed to the item container
      let partial = lexeme.substr(ws.length);

      // starting list
      if (this.items.length == 0) {
        const item = new ListItemContainer(this.context as DocContext, this.id);
        this.lastIndent = { ws, depth };
        this.items.push(item);
        this.curItem = item;
        return BlockActions.CONTINUE;
      }

      if (this.lastIndent.ws == ws) {
        // siblings
        const item = new ListItemContainer(this.context as DocContext, this.id);
        this.items.push(item);
        this.curItem = item;
        return BlockActions.CONTINUE;
      } else if (this.isLineIndented(lexeme)) {
        // child
        this.curItem?.push(partial, def);
        return BlockActions.CONTINUE;
      } else {
        // indents don't match, so retry as a new list
        return BlockActions.REJECT;
      }
    } else if (isLineEnd(lexeme)) {
      // consecutive newlines
      if (this.detectNewLine) {
        return BlockActions.DONE;
      }

      this.curItem?.push(lexeme, def);
      this.detectNewLine = true;
      return BlockActions.CONTINUE;
    } else if (!this.detectNewLine) {
      // continuation of item start line
      this.curItem?.push(lexeme, def);
      return BlockActions.CONTINUE;
    } else if (this.isLineIndented(lexeme)) {
      // new line and indented to last item start
      this.detectNewLine = false;
      const partial = lexeme.substr(this.lastIndent.depth);
      this.curItem?.push(partial, def);
      return BlockActions.CONTINUE;
    }

    return BlockActions.REJECT;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new ListHandler();
  }

  toString() {
    return `<${this.listStyle}>\n${this.items.join("\n")}\n</${
      this.listStyle
    }>`;
  }
}
