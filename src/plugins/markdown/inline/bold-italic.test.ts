import { expect } from "chai";
import { BoldHandler } from "./bold-italic";
import { InlineActions } from "../../../types";

/**
 * Because {@see BoldHandler}, {@see ItalicHandler}, {@see StrongHandler}, and {@see EmphasisHandler}
 * use the same base class, only one handler will be tested.
 */
describe("plugins.markdown.inline.BoldHandler", () => {
  const subject = new BoldHandler();
  it("accepts __", () => {
    expect(subject.canAccept("__")).to.be.true;
  });
  it("builds a bold tag and rejects __ after close", () => {
    subject.push("__");
    subject.push("bold");
    const actionDone = subject.push("__");
    const actionReject = subject.push("__");
    expect(subject.toString()).to.equal("<b>bold</b>");
    expect(actionDone).to.equal(InlineActions.POP);
    expect(actionReject).to.equal(InlineActions.REJECT);
  });
});
