import { expect } from "chai";
import { startHtmlTagLookahead } from "./lexdef.lookaheads";
import { DocProcessor } from "../../doc-processor";
import { LinkHandler } from "./inline/link";
import { InlineActions } from "../../types";
import { EnclosingTagState, HtmlBlockHandler } from "./html";
import exp = require("constants");

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
    let subject: HtmlBlockHandler | any = {};

    let actions: InlineActions[] = [];
    beforeEach(() => {
      subject = new HtmlBlockHandler();
      subject.setContext(docproc.makeContext());
      actions = [];
    });

    const buildHtml = (lexemes: string[]) => {
      lexemes.forEach((lex) => {
        actions.push(subject.push(lex));
      });
    };

    it("builds html as expected", () => {
      buildHtml([
        "<div",
        " key='val'",
        ">",
        "body",
        " ",
        "is",
        " ",
        "**",
        "bold",
        "**",
        "</div",
        ">",
      ]);
      expect(subject.toString()).to.equal(
        "<div key='val'>body is **bold**</div>"
      );
      expect(subject.state).to.equal(EnclosingTagState.tag_closed);
    });
  });
});
