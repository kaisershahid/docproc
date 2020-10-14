import { expect } from "chai";
import { DocProcessor } from "./doc-processor";
import {
  BlockActions,
  BlockHandlerType,
  DocProcContext,
  HandlerInterface,
  LexemeDef,
} from "./types";
import { isLineEnd } from "./utils";

class DummyHandler implements HandlerInterface<BlockHandlerType> {
  static count = 0;
  static receivedLexemes: [string, string][] = [];

  name = "";
  count = 0;
  context?: DocProcContext;
  accepting: { [key: string]: boolean } = {};
  lexemeDone: string = "\n";
  afterPushQueue: BlockActions[] = [];

  constructor(name: string, accepting: any) {
    this.name = name;
    this.accepting = accepting;
    this.count = DummyHandler.count++;
  }

  canAccept(lexeme: string): boolean {
    return this.accepting[lexeme] || false;
  }

  getName() {
    return this.name;
  }

  push(lex: string, def: LexemeDef | undefined): BlockActions {
    if (this.lexemeDone == lex) {
      DummyHandler.receivedLexemes.push([this.name, lex]);
      return BlockActions.DONE;
    }

    if (this.accepting[lex]) {
      DummyHandler.receivedLexemes.push([this.name, lex]);
      return BlockActions.CONTINUE;
    }

    return BlockActions.REJECT;
  }

  setContext(context: DocProcContext) {
    this.context = context;
  }

  cloneInstance() {
    return new DummyHandler(this.name, this.accepting);
  }

  toString() {
    return "";
  }
}

class ReorderHandler extends DummyHandler {
  blocks: any[] = [];
  canAccept(lexeme: string): boolean {
    return lexeme == "#";
  }

  cloneInstance() {
    return new ReorderHandler(this.name, this.accepting);
  }

  push(lex: string, def: LexemeDef | undefined): BlockActions {
    if (lex == "#") {
      return BlockActions.CONTINUE;
    } else if (isLineEnd(lex)) {
      return BlockActions.REORDER;
    } else {
      return BlockActions.REJECT;
    }
  }

  modifyBlocks(
    blocks: HandlerInterface<BlockHandlerType>[]
  ): HandlerInterface<BlockHandlerType>[] {
    this.blocks.push(blocks.shift());
    this.blocks.push(blocks.shift());
    console.log(">>", blocks);
    return blocks;
  }

  toString() {
    return `reordered(${this.blocks.join("\n")})`;
  }
}

describe("DocProcessor", () => {
  it("follows proper handling of block handler transitions", () => {
    /*
	  we're expecting the folling:
	  handler1 gets '##' and '@@', and ends on '\n'
	  handler2 gets '!!' and rejects '@@'
	  handler1 gets '@@'
	  */
    const subject = new DocProcessor();
    const lexer = subject.getLexer();
    lexer.mergeLexemes({
      "#": { priority: 1, upTo: 2 },
      "@": { priority: 5, upTo: 2 },
      "\n": { priority: 2 },
      "!": { priority: 3, upTo: 2 },
    });

    const handler1 = new DummyHandler("hash-nl", { "##": true, "@@": true });
    handler1.lexemeDone = "\n";
    const handler2 = new DummyHandler("exclamation", { "!!": true });

    subject.getBlockManager().addHandler(handler1);
    subject.getBlockManager().addHandler(handler2);

    const document = `##@@\n!!@@`;
    subject.process(document);
    // @todo expect
  });

  it("allows block reordering through BlockActions.REORDER", () => {
    const subject = new DocProcessor();
    subject.getLexer().mergeLexemes({
      "#": { priority: 1 },
      ">": { priority: 1, upTo: 2 },
      "\n": { priority: 2 },
    });

    const handler1 = new ReorderHandler("reorder", { "#": true });
    handler1.lexemeDone = "\n";
    subject.getBlockManager().addHandler(handler1);

    const document = `> p1\n\n> p2\n\n#\n\n> p3`;
    subject.process(document);
    expect(subject.toString()).to.equal(
      "reordered(<p>> p1</p>\n<p>> p2</p>)\n<p>> p3</p>"
    );
  });
});
