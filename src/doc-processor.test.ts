import { DocProcessor } from "./doc-processor";
import {
  AfterPushStatus,
  BlockHandlerType,
  DocContext,
  HandlerInterface,
  LexemeDef,
} from "./types";

class DummyHandler implements HandlerInterface<BlockHandlerType> {
  static count = 0;
  static receivedLexemes: [string, string][] = [];

  name = "";
  count = 0;
  context?: DocContext;
  accepting: { [key: string]: boolean } = {};
  lexemeDone: string = "\n";
  afterPushQueue: AfterPushStatus[] = [];

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

  push(lex: string, def: LexemeDef | undefined) {
    if (this.lexemeDone == lex) {
      DummyHandler.receivedLexemes.push([this.name, lex]);
      return AfterPushStatus.DONE;
    }

    if (this.accepting[lex]) {
      DummyHandler.receivedLexemes.push([this.name, lex]);
      return AfterPushStatus.CONTINUE;
    }

    return AfterPushStatus.REJECT;
  }

  setContext(context: DocContext) {
    this.context = context;
  }

  cloneInstance() {
    const clone = new DummyHandler(this.name, this.accepting);
    return clone;
  }
}

describe("DocProcessor", () => {
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
  // handler1.accepting = ;
  handler1.lexemeDone = "\n";
  const handler2 = new DummyHandler("exclamation", { "!!": true });
  // handler1.accepting = ;

  subject.getBlockManager().addHandler(handler1);
  subject.getBlockManager().addHandler(handler2);

  const document = `##@@\n!!@@`;

  it("follows proper handling of block handler transitions", () => {
    subject.process(document);
  });
});
