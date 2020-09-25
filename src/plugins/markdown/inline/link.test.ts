import { expect } from "chai";
import {
  BaseLinkHandler,
  ImageHandler,
  LinkHandler,
  LinkHandlerState,
} from "./link";
import { DocProcessor } from "../../../doc-processor";
import { InlineActions } from "../../../types";

describe.only("plugins.markdown.inline.link", () => {
  /**
   * Covers all facets of link lifecycle.
   */
  describe("LinkHandler", () => {
    const docproc = new DocProcessor();
    let subject: LinkHandler | any = {};

    let actions: InlineActions[] = [];
    beforeEach(() => {
      subject = new LinkHandler();
      subject.setContext(docproc.makeContext());
      actions = [];
    });

    const buildLink = (lexemes: string[]) => {
      lexemes.forEach((lex) => {
        actions.push(subject.push(lex));
      });
    };

    it("builds link as expected", () => {
      buildLink(["[", "text", "]", "[", "\\", "]", "]"]);
      expect(subject.toString()).to.equal('<a href="]" alt="text">text</a>');
      expect(actions[actions.length - 1]).to.equal(InlineActions.POP);
    });

    it("stops building link after text closing ]", () => {
      buildLink(["[", "text", "]", " ", "[", "hello"]);
      expect(actions[3]).to.equal(InlineActions.REJECT);
    });

    it("produces correct next actions based on state", () => {
      [
        {
          state: LinkHandlerState.text_open,
          lexeme: "a",
          expect: InlineActions.DEFER,
          errMessage: "when in text mode and not receiving ], DEFER",
        },
        {
          state: LinkHandlerState.text_open,
          lexeme: "]",
          expect: InlineActions.CONTINUE,
          errMessage: "when in text mode and receiving ], CONTINUE",
        },
        {
          state: LinkHandlerState.text_closed,
          lexeme: "(",
          expect: InlineActions.CONTINUE,
          errMessage: "when text is closed, CONTINUE for ( or [",
        },
        {
          state: LinkHandlerState.text_closed,
          lexeme: "a",
          expect: InlineActions.REJECT,
          errMessage: "when text is closed. REJECT non-url openers",
        },
        {
          state: LinkHandlerState.url_open,
          lexeme: ")",
          expect: InlineActions.CONTINUE,
          errMessage:
            "when in link mode, CONTINUE until non-closer is processed",
        },
      ].forEach((scenario) => {
        subject.state = scenario.state;
        expect(subject.nextAction(scenario.lexeme)).to.equal(
          scenario.expect,
          scenario.errMessage
        );
      });
    });
  });

  /**
   * Ensures proper <img /> production
   */
  describe("ImageHandler", () => {
    const docproc = new DocProcessor();
    let subject: ImageHandler | any = {};

    let actions: InlineActions[] = [];
    beforeEach(() => {
      subject = new ImageHandler();
      subject.setContext(docproc.makeContext());
      actions = [];
    });

    const buildLink = (lexemes: string[]) => {
      lexemes.forEach((lex) => {
        actions.push(subject.push(lex));
      });
    };

    it("builds image as expected", () => {
      buildLink(["![", "text &", "]", "[", "\\", "]", "]"]);
      expect(subject.toString()).to.equal('<img src="]" alt="text &amp;" />');
    });
  });
});
