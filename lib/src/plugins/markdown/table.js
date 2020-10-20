"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableHandler = exports.TableCell = exports.TableRow = void 0;
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const block_base_1 = require("../../defaults/block-base");
class TableRow {
    constructor() {
        this.cells = [];
        this.isHeader = false;
    }
    push(cell) {
        this.cells.push(cell);
    }
    curCell() {
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
exports.TableRow = TableRow;
class TableCell {
    constructor(context) {
        this.tag = "td";
        this.context = context;
        this.formatter = context.getInlineFormatter();
    }
    push(lexeme, def) {
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
exports.TableCell = TableCell;
/**
 * Handle tables.
 */
class TableHandler extends block_base_1.BlockBase {
    constructor() {
        super(...arguments);
        this.started = false;
        this.lastLex = "";
        this.lastLineEnd = false;
        this.rows = [];
        this.foundHeader = false;
    }
    getName() {
        return "code";
    }
    canAccept(lexeme, def) {
        return lexeme[0] == "|";
    }
    curRow() {
        const idx = this.rows.length - 1;
        const row = this.rows[idx];
        if (row) {
            return row;
        }
        throw new Error("could not get row");
    }
    push(lexeme, def) {
        let ret = types_1.BlockActions.REJECT;
        const lineEnd = utils_1.isLineEnd(lexeme);
        const lineWs = utils_1.isWhitespace(lexeme) && !lineEnd;
        // ignore whitespace immediately after newline
        if (lineWs && this.lastLineEnd) {
            return types_1.BlockActions.CONTINUE;
        }
        if (lexeme == "|") {
            ret = this.handlePipe(def);
        }
        else if (!lineEnd) {
            ret = this.handleCell(lexeme, def);
        }
        else if (lineEnd) {
            ret = this.handleLineEnd(def);
        }
        this.lastLex = lexeme;
        this.lastLineEnd = lineEnd;
        return ret;
    }
    handlePipe(def) {
        const makeNewRow = !this.started || this.lastLineEnd;
        if (!this.started) {
            this.started = true;
        }
        if (makeNewRow) {
            const row = new TableRow();
            this.rows.push(row);
        }
        this.curRow().push(new TableCell(this.context));
        return types_1.BlockActions.CONTINUE;
    }
    handleCell(lexeme, def) {
        this.curRow().curCell().push(lexeme, def);
        return types_1.BlockActions.CONTINUE;
    }
    handleLineEnd(def) {
        let ret = types_1.BlockActions.REJECT;
        if (!this.lastLineEnd) {
            ret = types_1.BlockActions.CONTINUE;
            if (!this.foundHeader && this.rows.length == 2) {
                this.detectAndSetHeader();
            }
        }
        return ret;
    }
    detectAndSetHeader() {
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
    cloneInstance() {
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
exports.TableHandler = TableHandler;
