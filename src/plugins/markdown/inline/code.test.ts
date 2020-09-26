import { expect } from "chai";
import { BoldHandler } from "./bold-italic";
import { InlineActions } from "../../../types";
import { CodeHandler } from "./code";

describe("plugins.markdown.inline.CodeHandler", () => {
  const subject = new CodeHandler();
  it("accepts `", () => {
    expect(subject.canAccept("`")).to.be.true;
  });
  it("builds a code tag, does not defer within tag, and rejects ` after close", () => {
    subject.push("`");
    subject.push("code");
    const nextAction = subject.nextAction("*");
    subject.push("*");
    subject.push("\\");
    subject.push("`");
    const actionDone = subject.push("`");
    const actionReject = subject.push("`");

    expect(subject.toString()).to.equal("<code>code*`</code>");

    expect(nextAction).to.equal(
      InlineActions.CONTINUE,
      "nextAction should be CONTINUE"
    );
    expect(actionDone).to.equal(
      InlineActions.POP,
      "action after close should be POP"
    );
    expect(actionReject).to.equal(
      InlineActions.REJECT,
      "lexeme after close should be REJECT"
    );
  });
});
