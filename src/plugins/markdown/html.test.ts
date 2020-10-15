import { expect } from "chai";
import { startHtmlTagLookahead } from "./lexdef.lookaheads";
import { DocProcessor } from "../../doc-processor";
import { LinkHandler } from "./inline/link";
import { InlineActions } from "../../types";
import { EnclosingTagState, HtmlBlockHandler } from "./html";
import exp = require("constants");
import { registerPlugin } from "./index";
import doc = Mocha.reporters.doc;

describe("plugins.markdown.html", () => {
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
    before(() => {
      registerPlugin(docproc);
    });

    it("builds html as expected with <p/>", () => {
      const dc = new DocProcessor(docproc.makeContext());
      dc.process("<p key='val'>body is **bold**</p>");
      expect(dc.toString()).to.equal(
        "<p key='val'>body is <strong>bold</strong></p>\n"
      );
    });

    it("builds html as expected with <div/> (container)", () => {
      const dc = new DocProcessor(docproc.makeContext());
      dc.process("<div key='val'>body is **bold**\n\n> blockquote</div>");
      const html = dc.toString();
      expect(html).to.equal(`<div key='val'><p>body is <strong>bold</strong></p>
<blockquote><p>blockquote</p></blockquote></div>
`);
    });

    it("container tag properly tracks nested tags of same name", () => {
      const dc = new DocProcessor(docproc.makeContext());
      dc.process("<div key='val'>goodbye <div>hello</div> </div>");
      const html = dc.toString();
      expect(html).to.equal(`<div key='val'><p>goodbye</p>
<div><p>hello</p></div>
</div>
`);
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
      expect(dc.toString()).to.equal("<style>body is **bold**</style>\n");
    });

    it("ignores markup in attributes", () => {
      const dc = new DocProcessor(docproc.makeContext());
      dc.process("<span key='**val**'>body is **bold**</span>");
      expect(dc.toString()).to.equal(
        "<p><span key='**val**'>body is <strong>bold</strong></span></p>"
      );
    });
  });
  describe("HtmlTagHandler", () => {});
});
