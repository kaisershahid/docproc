import { expect } from "chai";
import { HandlerManager, insertAfter, insertBefore } from "./handler-manager";
import {
  BlockHandlerType,
  DocProcContext,
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

  setContext(context: DocProcContext) {}

  cloneInstance() {
    return this;
  }
}

describe("HandlerManager", () => {
  it("insertBefore properly splices array", () => {
    const arr = ["a", "b", "c"];
    const newArr = insertBefore("d", 1, arr);
    expect(newArr).to.deep.equal(["a", "d", "b", "c"]);
  });
  it("insertAfter properly splices array", () => {
    const arr = ["a", "b", "c"];
    const newArr = insertAfter("d", 1, arr);
    expect(newArr).to.deep.equal(["a", "b", "d", "c"]);
  });

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
