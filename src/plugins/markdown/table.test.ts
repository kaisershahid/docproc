import { expect } from "chai";
import { addToLexer } from "./lexdef.commonmark";
import { BlockHandlerType } from "../../types";
import { DocProcessor } from "../../doc-processor";
import { ListHandler } from "./list";
import { HandlerManager } from "../../handler-manager";
import { Lexer } from "../../lexer";
import { ParagraphHandler } from "./paragraph";
import { TableHandler } from "./table";

describe("plugins.markdown.code", () => {
  const subject = new ListHandler();
  const blockManager = new HandlerManager<BlockHandlerType>();
  blockManager.addHandler(subject);
  blockManager.addHandler(new ParagraphHandler());
  blockManager.addHandler(new TableHandler());
  const lexer = new Lexer();
  addToLexer(lexer, true);
  const docprocBase = new DocProcessor({ blockManager, lexer });

  const docSingleRow = `|col1|col2|col3`;
  const docWithHeader = `|hdr1|hdr2|hdr3\n|---|---|---\n${docSingleRow}`;

  it.only("handles single-row table", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process(docSingleRow);
    const table = docproc.toString();
    expect(table).to.match(/^<table/);
    expect(table).to.contain(
      `<tr><td>col1</td><td>col2</td><td>col3</td></tr>`
    );
    expect(table).to.match(/<\/table>$/);
  });
  it.only("handles table with header", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process(docWithHeader);
    const table = docproc.toString();
    expect(table).to.match(/^<table/);
    expect(table).to.contain(
      `<tr><th>hdr1</th><th>hdr2</th><th>hdr3</th></tr>`
    );
    expect(table).to.contain(
      `<tr><td>col1</td><td>col2</td><td>col3</td></tr>`
    );
    expect(table).to.match(/<\/table>$/);
  });
});
