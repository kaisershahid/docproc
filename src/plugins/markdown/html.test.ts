import { expect } from "chai";
import { startHtmlTagLookahead } from "./lexdef.lookaheads";
import { DocProcessor } from "../../doc-processor";
import { LinkHandler } from "./inline/link";
import { InlineActions } from "../../types";
import { EnclosingTagState, HtmlBlockHandler } from "./html";
import exp = require("constants");
import { registerPlugin } from "./index";
import doc = Mocha.reporters.doc;

describe.only("plugins.markdown.html", () => {
  describe("lex.commonmark: startHtmlTagLookahead()", () => {
    it("matches start of html tag '<html:body key=val'", () => {
      const lookahead = startHtmlTagLookahead("<html:body key=val", "<", 1, {
        priority: 1,
      });
      expect(lookahead.newLexeme).to.equal("<html:body");
    });
  });
  describe("HtmlBlockHandler", () => {
    const docproc = new DocProcessor();
    registerPlugin(docproc);

    it("builds html as expected", () => {
      const dc = new DocProcessor(docproc.makeContext());
      dc.process("<div key='val'>body is **bold**</div>");
      expect(dc.toString()).to.equal(
        "<div key='val'>body is <strong>bold</strong></div>"
      );
    });

    it("ignores non-block tag", () => {
      const dc = new DocProcessor(docproc.makeContext());
      dc.process("<span key='val'>body is **bold**</span>");
      expect(dc.toString()).to.equal(
        "<p><span key='val'>body is <strong>bold</strong></span></p>"
      );
    });

    it("passes content through for <style> body", () => {
      const dc = new DocProcessor(docproc.makeContext());
      dc.process("<style>body is **bold**</style>");
      expect(dc.toString()).to.equal("<style>body is **bold**</style>");
    });
  });
});
