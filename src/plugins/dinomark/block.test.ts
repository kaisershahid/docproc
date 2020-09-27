import { expect } from "chai";
import { DinoBlockHandler } from "./block";

describe.only("plugins.dinomark.DinoBlockHandler", () => {
  it('extracts [@directive]: text-value ("string")', () => {
    const subject = new DinoBlockHandler();
    [
      "[@",
      "directive",
      "]",
      ":",
      " ",
      "text-value",
      " ",
      "(",
      '"',
      "string",
      '"',
      ")",
      "\n",
      "\n",
    ].forEach((t) => subject.push(t));
    subject.handlerEnd();
    expect(subject.directives[0]).to.deep.equal({
      directive: "directive",
      action: "text-value",
      parameters: '"string"',
    });
  });
});
