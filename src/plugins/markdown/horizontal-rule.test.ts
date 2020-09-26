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

describe("plugins.markdown.code", () => {
  const subject = new ListHandler();
  const blockManager = new HandlerManager<BlockHandlerType>();
  blockManager.addHandler(subject);
  blockManager.addHandler(new ParagraphHandler());
  blockManager.addHandler(new HorizontalRuleHandler());
  const lexer = new Lexer();
  addToLexer(lexer, true);
  const docprocBase = new DocProcessor({ blockManager, lexer });

  it("handles ---", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("---");
    const html = docproc.toString();
    expect(html).to.equal(`<hr />`);
  });

  it("handles ****", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("****");
    const html = docproc.toString();
    expect(html).to.equal(`<hr />`);
  });

  it("handles 2 rows of ****", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("****\n****");
    const html = docproc.toString();
    expect(html).to.equal(`<hr />\n<hr />`);
  });

  it("handles ---- abc...", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("---- abc...");
    const html = docproc.toString();
    expect(html).to.equal(`<hr />`);
  });

  it("handles ----\\nabc...", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("----\nabc...");
    const html = docproc.toString();
    expect(html).to.equal(`<hr />\n<p>abc...</p>`);
  });
});
