import { expect } from "chai";
import { HandlerManager } from "./handler-manager";
import { TestInlineHandler } from "./inline/__test";
import { InlineStateBuffer } from "./inline/state-buffer";
import { InlineHandlerType } from "./types";

describe.only("inline.InlineStateBuffer", () => {
  const manager = new HandlerManager<InlineHandlerType>();
  const boldHandler = new TestInlineHandler("**", "<b>", "</b>");
  const italHandler = new TestInlineHandler("*", "<i>", "</i>");
  const subject = new InlineStateBuffer(manager);

  manager.addHandler(boldHandler);
  manager.addHandler(italHandler);

  it("collects random word", () => {
    subject.push("hello");
    expect(subject.toString()).to.equal("hello");
  });
  it("starts **", () => {
    subject.push(" ");
    subject.push("**");
    subject.push("this is bold");
    expect(subject.toString()).to.equal("hello <b>this is bold</b>");
  });
  it("starts and nests *", () => {
    subject.push(" ");
    subject.push("*");
    subject.push("this is italic");
    subject.push("*");
    subject.push(" continue bold");

    expect(subject.toString()).to.equal(
      "hello <b>this is bold <i>this is italic</i> continue bold</b>"
    );
  });
  it("completes **", () => {
    subject.push("**");
    subject.push(" outside bold");
    expect(subject.toString()).to.equal(
      "hello <b>this is bold <i>this is italic</i> continue bold</b> outside bold"
    );
  });
});
