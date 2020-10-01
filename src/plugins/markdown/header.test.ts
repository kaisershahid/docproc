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
import { HEADER_DATA_CATEGORY, HeaderHandler } from "./header";
import { makeDataRegistry } from "../../data-registry";

describe.only("plugins.markdown.header", () => {
  const subject = new ListHandler();
  const blockManager = new HandlerManager<BlockHandlerType>();
  blockManager.addHandler(subject);
  blockManager.addHandler(new ParagraphHandler());
  blockManager.addHandler(new HeaderHandler());
  const lexer = new Lexer();
  addToLexer(lexer, true);
  const dataRegistry = makeDataRegistry();
  dataRegistry.addItem("@", { initFlag: true });
  const docprocBase = new DocProcessor({ blockManager, lexer, dataRegistry });

  it("handles # header1", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("# header1");
    const html = docproc.toString();
    expect(html).to.equal(`<h1 id="header1-1"> header1</h1>`);
  });
  it("registers header1 in the data registry", () => {
    const items = dataRegistry.getItems(HEADER_DATA_CATEGORY);
    expect(items[0]).to.deep.equal({
      id: "header1-1",
      content: " header1",
      level: 1,
    });
  });

  it("handles # header1\\n###### header6", () => {
    const context = docprocBase.makeContext();
    const docproc = new DocProcessor(context);
    docproc.process("# header1\n###### header6");
    const html = docproc.toString();
    expect(html).to.equal(
      `<h1 id="header1-2"> header1</h1>\n<h6 id="header6-3"> header6</h6>`
    );
  });
  it("registers header6 in the data registry", () => {
    const items = dataRegistry.getItems(HEADER_DATA_CATEGORY);
    expect(items[2]).to.deep.equal({
      id: "header6-3",
      content: " header6",
      level: 6,
    });
  });

  it("handles # header1\\nnew paragraph", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("# header1\nnew paragraph");
    const html = docproc.toString();
    expect(html).to.equal(
      `<h1 id="header1-4"> header1</h1>\n<p>new paragraph</p>`
    );
  });
});
