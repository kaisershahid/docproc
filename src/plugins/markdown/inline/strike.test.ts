import { expect } from "chai";
import { InlineHandlerState, StrikeHandler } from "./strike";
import { InlineActions } from "../../../types";

describe.only("plugins.markdown.inline.StrikeHandler", () => {
  const subject = new StrikeHandler();
  it("accepts ~", () => {
    expect(subject.canAccept("~")).to.be.true;
  });
  it("goes into opening state with ~", () => {
    subject.push("~");
    expect(subject.state).to.equal(InlineHandlerState.opening);
    subject.push("~");
    expect(subject.state).to.equal(InlineHandlerState.opening);
  });
  it("goes into opened state with escaped and non-~", () => {
    subject.push("\\");
    subject.push("~");
    subject.push("ab");
    expect(subject.state).to.equal(InlineHandlerState.opened);
  });
  it("goes into closing state with ~", () => {
    subject.push("~");
    expect(subject.state).to.equal(InlineHandlerState.closing);
    const action = subject.push("~");
    expect(subject.state).to.equal(InlineHandlerState.closing);
    expect(action).to.equal(InlineActions.CONTINUE);
  });
  it("rejects non-~ after closing", () => {
    const action = subject.push("a");
    expect(subject.state).to.equal(InlineHandlerState.closed);
    expect(action).to.equal(InlineActions.REJECT);
  });
  it("builds a strikethrough tag", () => {
    expect(subject.toString()).to.equal("<del>~ab</del>");
  });
});
