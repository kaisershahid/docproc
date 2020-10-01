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

export class TableRow {
  cells: TableCell[] = [];
  isHeader = false;

  push(cell: TableCell) {
    this.cells.push(cell);
  }

  curCell(): TableCell {
    const idx = this.cells.length - 1;
    const cell = this.cells[idx];
    if (cell) {
      return cell;
    }

    throw new Error("no cell found");
  }

  setAsHeader() {
    this.isHeader = true;
    this.cells.forEach((c) => c.setAsHeader());
  }

  toString() {
    if (this.isHeader) {
      return `  <thead>\n    <tr>${this.cells.join("")}</tr>\n  </thead>`;
    }
    return `<tr>${this.cells.join("")}</tr>`;
  }
}

export class TableCell {
  context: DocProcContext;
  formatter: InlineFormatterInterface;
  tag = "td";

  constructor(context: DocProcContext) {
    this.context = context;
    this.formatter = context.getInlineFormatter();
  }

  push(lexeme: string, def?: LexemeDef) {
    this.formatter.push(lexeme, def);
  }

  setAsHeader() {
    this.tag = "th";
  }

  buffToString() {
    return this.formatter.toString();
  }

  toString() {
    return `<${this.tag}>${this.formatter.toString()}</${this.tag}>`;
  }
}

/**
 * Handle tables.
 */
export class TableHandler extends BlockBase {
  getName() {
    return "code";
  }

  canAccept(lexeme: string, def?: LexemeDef) {
    return lexeme[0] == "|";
  }

  started = false;
  lastLex = "";
  lastLineEnd = false;
  rows: TableRow[] = [];
  foundHeader = false;

  curRow(): TableRow {
    const idx = this.rows.length - 1;
    const row = this.rows[idx];
    if (row) {
      return row;
    }

    throw new Error("could not get row");
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    let ret = BlockActions.REJECT;
    const lineEnd = isLineEnd(lexeme);

    if (lexeme == "|") {
      ret = this.handlePipe(def);
    } else if (!lineEnd) {
      ret = this.handleCell(lexeme, def);
    } else if (lineEnd) {
      ret = this.handleLineEnd(def);
    }

    this.lastLex = lexeme;
    this.lastLineEnd = lineEnd;
    return ret;
  }

  protected handlePipe(def?: LexemeDef): BlockActions {
    const makeNewRow = !this.started || this.lastLineEnd;
    if (!this.started) {
      this.started = true;
    }

    if (makeNewRow) {
      const row = new TableRow();
      this.rows.push(row);
    }

    this.curRow().push(new TableCell(this.context as DocProcContext));
    return BlockActions.CONTINUE;
  }

  protected handleCell(lexeme: string, def?: LexemeDef): BlockActions {
    this.curRow().curCell().push(lexeme, def);
    return BlockActions.CONTINUE;
  }

  protected handleLineEnd(def?: LexemeDef): BlockActions {
    let ret = BlockActions.REJECT;
    if (!this.lastLineEnd) {
      ret = BlockActions.CONTINUE;
      if (!this.foundHeader && this.rows.length == 2) {
        this.detectAndSetHeader();
      }
    }

    return ret;
  }

  protected detectAndSetHeader() {
    let count = 0;
    this.curRow().cells.forEach((c) => {
      if (c.buffToString().match(/^\s*---*\s*$/)) {
        count++;
      }
    });
    if (count == this.curRow().cells.length) {
      this.foundHeader = true;
      this.rows.pop();
      this.curRow().setAsHeader();
    }
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new TableHandler();
  }

  toString() {
    if (this.foundHeader) {
      const [row1, ...rest] = this.rows;
      return `<table>
${row1}
  <tbody>
    ${rest.join("\n    ")}
  </tbody>
</table>`;
    }

    return `<table>
  <tbody>
    ${this.rows.join("\n    ")}
  </tbody>
</table>`;
  }
}
