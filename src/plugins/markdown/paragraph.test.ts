import { ParagraphBlockHandler } from "./paragraph";
import { expect } from "chai";
import { AfterPushStatus } from "../../types";

describe.only("plugins.markdown.blocks.paragraph", () => {
  const subject = new ParagraphBlockHandler();
  it("always accepts lexemes", () => {
    expect(subject.canAccept("")).to.equal(true);
    expect(subject.canAccept("\n")).to.equal(true);
  });
  it("it returns DONE on 2 consecutive line ends", () => {
    expect(subject.push("\n")).to.equal(AfterPushStatus.CONTINUE);
    expect(subject.push("\r")).to.equal(AfterPushStatus.DONE);
  });
});
