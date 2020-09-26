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
import {
  getLinkrefByKey,
  Linkref,
  LinkrefParagraphHandler,
} from "./linkref-paragraph";

describe("plugins.markdown.LinkrefHandler", () => {
  const subject = new ListHandler();
  const blockManager = new HandlerManager<BlockHandlerType>();
  blockManager.addHandler(subject);
  blockManager.addHandler(new ParagraphHandler());
  blockManager.addHandler(new LinkrefParagraphHandler());
  const lexer = new Lexer();
  addToLexer(lexer, true);
  const docprocBase = new DocProcessor({ blockManager, lexer });

  const ref1 = "[key1]: http://url";
  const ref2 = "[key2]: http://url2 (comment(\\))";

  it("handles two properly formed refs", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process(`${ref1}\n${ref2}`);
    const linkref1 = getLinkrefByKey("key1") ?? new Linkref();
    const linkref2 = getLinkrefByKey("key2") ?? new Linkref();
    expect(linkref1).to.deep.equal({
      key: "key1",
      url: "http://url",
      comment: "",
    });
    expect(linkref2).to.deep.equal({
      key: "key2",
      url: "http://url2",
      comment: "comment()",
    });
    expect(docproc.toString().replace(/\s*/, "")).to.equal("");
  });

  it("falls back to paragraph when line is incorrectly formatted", () => {
    const docproc = new DocProcessor(docprocBase.makeContext());
    docproc.process(`[key2] but not reallly`);
    expect(docproc.toString()).to.equal("<p>[key2] but not reallly</p>");
  });
});
