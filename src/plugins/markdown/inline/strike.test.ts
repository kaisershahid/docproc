import { expect } from "chai";
import { InlineHandlerState, StrikeHandler } from "./strike";
import { InlineActions } from "../../../types";
import { DocProcessor } from "../../../doc-processor";
import { InlineStateBuffer } from "../../../inline/state-buffer";

describe("plugins.markdown.inline.StrikeHandler", () => {
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
  it("works well with InlineStateBuffer", () => {
    const docproc = new DocProcessor();
    const context = docproc.makeContext();
    context.inlineManager.addHandler(new StrikeHandler());
    const inline = context.getInlineFormatter() as InlineStateBuffer;
    ["hello", "~~", "strike", "~~"].forEach((t) => inline.push(t));
    const html = inline.toString();
    expect(html).to.equal("hello<del>strike</del>");
  });
});
