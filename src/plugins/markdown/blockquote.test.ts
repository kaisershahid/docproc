import { BlockquoteHandler } from "./blockquote";
import { expect } from "chai";
import { BlockHandlerType } from "../../types";
import { DocProcessor } from "../../doc-processor";
import { HandlerManager } from "../../handler-manager";
import { addToLexer } from "./lexdef.commonmark";

describe("plugins.markdown.blocks.paragraph", () => {
  const subject = new BlockquoteHandler();
  const blockManager = new HandlerManager<BlockHandlerType>();
  blockManager.addHandler(subject);

  const docproc = new DocProcessor({ blockManager });
  addToLexer(docproc.getLexer());
  subject.setContext(docproc.makeContext());

  it("accepts repeated '>' at start of string", () => {
    expect(subject.canAccept(">")).to.equal(true);
    expect(subject.canAccept(">>")).to.equal(true);
    expect(subject.canAccept("> > ")).to.equal(true);
  });
  it("wraps output in <blockquote/>", () => {
    const str = subject.toString();
    expect(str).to.match(/^<blockquote>/);
    expect(str).to.match(/<\/blockquote>$/);
  });
  it("properly nests a multi-level blockquote block", () => {
    const document = "> block1\n>> block1.1\n> block2";
    docproc.process(document);
    expect(docproc.toString()).to.equal(
      "<blockquote><p>block1</p>\n" +
        "<blockquote><p>block1.1</p></blockquote>\n" +
        "<p>block2</p></blockquote>"
    );
  });
});
