import { expect } from "chai";
import { addToLexer } from "./lexdef.commonmark";
import {
  LEXEME_TYPE_LIST_ITEM_START,
  LEXEME_TYPE_WHITESPACE_START,
  REGEX_LIST_ITEM_START,
  REGEX_WHITESPACE_START,
  startingListItemDashStarLookahead,
  startingWhitespaceLookahead,
} from "./lexdef.lookaheads";
import { BlockHandlerType, LexemeLookaheadReturn } from "../../types";
import { DocProcessor } from "../../doc-processor";
import { ListHandler } from "./list";
import { HandlerManager } from "../../handler-manager";
import { ParagraphHandler } from "./paragraph";
import { Lexer } from "../../lexer";
import { BlockquoteHandler } from "./blockquote";

describe("plugins.markdown.list", () => {
  describe("lex.commonmark: REGEX_WHITESPACE_START", () => {
    it("matches starting whitespace/tabs", () => {
      expect("".match(REGEX_WHITESPACE_START)?.[1]).to.equal("");
      expect(" \t ".match(REGEX_WHITESPACE_START)?.[1]).to.equal(" \t ");
      expect("\t\t ".match(REGEX_WHITESPACE_START)?.[1]).to.equal("\t\t ");
      expect("a\t ".match(REGEX_WHITESPACE_START)?.[1]).to.equal("");
    });
    it("matches starting list items", () => {
      expect("1. ".match(REGEX_LIST_ITEM_START)?.[1]).to.equal("1.");
      expect("1) ".match(REGEX_LIST_ITEM_START)?.[1]).to.equal("1)");
      expect("- ".match(REGEX_LIST_ITEM_START)?.[1]).to.equal("-");
      expect("* ".match(REGEX_LIST_ITEM_START)?.[1]).to.equal("*");
    });
  });
  describe("lex.commonmark: startingWhitespaceLookahead()", () => {
    it("returned undefined for ''", () => {
      expect(startingWhitespaceLookahead("", "", 0)).to.deep.equal(undefined);
    });
    it("returned lookaheadReturn value for '\\n\\tloo' at 2", () => {
      const lookahead = startingWhitespaceLookahead("\n\t", "\t", 2);
      expect(lookahead).to.deep.equal({
        newLexeme: "\t",
        nextIndex: 2,
        newLexemeDef: {
          type: LEXEME_TYPE_WHITESPACE_START,
        },
      });
    });
  });
  describe("lex.commonmark: startingDashStarLookahead()", () => {
    it("returned undefined for ''", () => {
      expect(startingWhitespaceLookahead("", "", 0)).to.deep.equal(undefined);
    });
    it("returned lookaheadReturn value for '\\n\\t1. ' at 2", () => {
      const lookahead = startingListItemDashStarLookahead("\n\t1. ", "\t", 2, {
        priority: 1,
      });
      expect(lookahead).to.deep.equal({
        newLexeme: "\t1.",
        nextIndex: 4,
        newLexemeDef: {
          type: LEXEME_TYPE_LIST_ITEM_START,
        },
      });
      // @todo add for 2 -
      // @todo add for 3+ *
    });
  });
  describe("ListHandler", () => {
    const subject = new ListHandler();
    const blockManager = new HandlerManager<BlockHandlerType>();
    blockManager.addHandler(subject);
    blockManager.addHandler(new ParagraphHandler());
    blockManager.addHandler(new BlockquoteHandler());
    const lexer = new Lexer();
    addToLexer(lexer, true);
    const docprocBase = new DocProcessor({ blockManager, lexer });

    // @todo make a json or yaml fixture for these scenarios
    it("handles 1 item", () => {
      const docproc = new DocProcessor(docprocBase.makeContext());
      docproc.process("- i1");
      expect(docproc.toString()).to.equal(`<ul>
<li><p>i1</p></li>
</ul>`);
    });
    it("handles 1 item with text continuing on indent", () => {
      const docproc = new DocProcessor(docprocBase.makeContext());
      docproc.process("- i1\n  more text");
      expect(docproc.toString()).to.equal(
        `<ul>
<li><p>i1
 more text</p></li>
</ul>`
      );
    });
    it("handles 2 items", () => {
      const docproc = new DocProcessor(docprocBase.makeContext());
      docproc.process("- i1\n* i2");
      expect(docproc.toString()).to.equal(
        `<ul>
<li><p>i1</p></li>
<li><p>i2</p></li>
</ul>`
      );
    });
    it("handles 2 items of different list types", () => {
      const docproc = new DocProcessor(docprocBase.makeContext());
      docproc.process("- i1\n1. i2 123.4");
      expect(docproc.toString()).to.equal(
        `<ul>
<li><p>i1</p></li>
</ul>
<ol>
<li><p>i2 123.4</p></li>
</ol>`
      );
    });
    it("handles item with nested subitem", () => {
      const docproc = new DocProcessor(docprocBase.makeContext());
      docproc.process("- i1\n  - i1.1");
      expect(docproc.toString()).to.equal(
        `<ul>
<li><p>i1</p>
<ul>
<li><p>i1.1</p></li>
</ul></li>
</ul>`
      );
    });
    it("handles item with blockquote", () => {
      const docproc = new DocProcessor(docprocBase.makeContext());
      docproc.process("1. i1\n  > hello");
      expect(docproc.toString()).to.equal(
        `<ol>
<li><p>i1</p>
<blockquote><p>hello</p></blockquote></li>
</ol>`
      );
    });
  });
});
