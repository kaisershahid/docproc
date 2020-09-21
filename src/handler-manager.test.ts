import { expect } from "chai";
import { HandlerManager } from "./handler-manager";
import {
  BlockHandlerType,
  DocContext,
  HandlerInterface,
  LexemeConsumer,
  LexemeDef,
} from "./types";

class DummyHandler implements HandlerInterface<BlockHandlerType> {
  name = "";
  constructor(name: string) {
    this.name = name;
  }

  canAccept(lexeme: string): boolean {
    return true;
  }

  getName() {
    return this.name;
  }

  push(lex: string, def: LexemeDef | undefined): this {
    return this;
  }

  setContext(context: DocContext) {}

  cloneInstance() {
    return this;
  }
}

describe("HandlerManager", () => {
  const subject = new HandlerManager();
  subject.addHandler(
    new DummyHandler("first") as HandlerInterface<BlockHandlerType>
  );
  subject.addHandler(new DummyHandler("first.before"), { before: "first" });
  subject.addHandler(new DummyHandler("first.after"), { after: "first" });
  subject.addHandler(new DummyHandler("last"));
  subject.addHandler(new DummyHandler("replaced"), { at: "last" });

  it("adds new handlers in expected order", () => {
    const expectedOrder: string[] = [
      "first.before",
      "first",
      "first.after",
      "replaced",
    ];
    let actualOrder: string[] = [];
    subject.withHandlers((handlers) => {
      actualOrder = handlers.map((handler) => handler.getName());
    });
    expect(actualOrder).to.deep.equal(expectedOrder);
  });
});
