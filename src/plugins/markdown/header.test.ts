import { expect } from "chai";
import { addToLexer } from "./lexdef.commonmark";
import { BlockHandlerType } from "../../types";
import { DocProcessor } from "../../doc-processor";
import { ListHandler } from "./list";
import { HandlerManager } from "../../handler-manager";
import { Lexer } from "../../lexer";
import { CodeHandler } from "./code";
import { ParagraphHandler } from "./paragraph";
import { HorizontalRuleHandler } from "./horizontal-rule";
import { HeaderHandler } from "./header";

describe.only("plugins.markdown.code", () => {
  const subject = new ListHandler();
  const blockManager = new HandlerManager<BlockHandlerType>();
  blockManager.addHandler(subject);
  blockManager.addHandler(new ParagraphHandler());
  blockManager.addHandler(new HeaderHandler());
  const lexer = new Lexer();
  addToLexer(lexer, true);
  const docprocBase = new DocProcessor({ blockManager, lexer });

  it("handles # header1", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("# header1");
    const html = docproc.toString();
    expect(html).to.equal(`<h1> header1</h1>`);
  });
  it("handles # header1\\n###### header6", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("# header1\n###### header6");
    const html = docproc.toString();
    expect(html).to.equal(`<h1> header1</h1>\n<h6> header6</h6>`);
  });
  it("handles # header1\\nnew paragraph", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("# header1\nnew paragraph");
    const html = docproc.toString();
    expect(html).to.equal(`<h1> header1</h1>\n<p>new paragraph</p>`);
  });
});
