import { expect } from "chai";
import { addToLexer } from "./lexdef.commonmark";
import { BlockHandlerType } from "../../types";
import { DocProcessor } from "../../doc-processor";
import { ListHandler } from "./list";
import { HandlerManager } from "../../handler-manager";
import { Lexer } from "../../lexer";
import { CodeHandler, CodeIndentedHandler } from "./code";
import { ParagraphHandler } from "./paragraph";

describe("plugins.markdown.code", () => {
  const subject = new ListHandler();
  const blockManager = new HandlerManager<BlockHandlerType>();
  blockManager.addHandler(subject);
  blockManager.addHandler(new ParagraphHandler());
  blockManager.addHandler(new CodeHandler());
  blockManager.addHandler(new CodeIndentedHandler());
  const lexer = new Lexer();
  addToLexer(lexer, true);
  const docprocBase = new DocProcessor({ blockManager, lexer });

  it("handles code with ``` and langtype definition", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("``` langtype\ncode\n```");
    expect(docproc.toString()).to.equal(
      `<pre class="markdown-block-code-langtype">code</pre>`
    );
  });
  it("handles code with opening spaces", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process("    code line 1\n    code line 2");
    expect(docproc.toString()).to.equal(
      `<pre class="markdown-block-code">code line 1\ncode line 2</pre>`
    );
  });
});
