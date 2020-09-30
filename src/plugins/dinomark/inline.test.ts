import { expect } from "chai";
import { DinoInlineHandler } from "./inline";
import { LinkMode } from "../markdown/inline/link";
import { DocProcessor } from "../../doc-processor";
import { VarReferenceGetter } from "./directives.var";

describe("plugins.dinomark.inline", () => {
  describe("VarReferenceGetter", () => {
    const subject = new VarReferenceGetter();
    const vars = {
      arr: [
        {
          "key.1": "value1",
        },
      ],
    };
    const expectedKeys = ["arr", "0", "key.1"];
    it("builds up proper sequence of keys", () => {
      ["arr", ".", "0", ".", "key", "\\", ".", "1"].forEach((t) =>
        subject.push(t)
      );
      expect(subject.keys).to.deep.equal(expectedKeys);
    });
    it("returns the correct value", () => {
      expect(subject.resolveValue({ vars })).to.equal("value1");
    });
  });
  describe("DinoInlineHandler", () => {
    it("handles url field as general statement", () => {
      const subject = new DinoInlineHandler();
      [
        "[]",
        "(",
        "$var",
        " ",
        "or",
        " ",
        "something",
        "(",
        "\\",
        ")",
        ")",
      ].forEach((t) => subject.push(t));
      expect(subject.link.url.toJSON().buffer.join("")).to.equal(
        "$var or something()"
      );
      expect(subject.link.mode).to.equal(LinkMode.url);
    });
    it("handles url field as key lookup", () => {
      const subject = new DinoInlineHandler();
      [
        "[]",
        "[",
        "$var",
        " ",
        "or",
        " ",
        "something",
        "[",
        "\\",
        "]",
        "]",
      ].forEach((t) => subject.push(t));
      expect(subject.link.url.toJSON()).to.deep.equal({
        type: "var-ref",
        keys: ["$var or something[]"],
      });
      expect(subject.link.mode).to.equal(LinkMode.ref);
    });
    it("outputs resolved value from context.vars on toString()", () => {
      const docproc = new DocProcessor({
        vars: {
          map: {
            key: "val",
          },
        },
      });
      const subject = new DinoInlineHandler();
      subject.setContext(docproc.makeContext());
      ["[]", "[", "map", ".", "key", "]"].forEach((t) => subject.push(t));
      expect(subject.toString()).to.equal("val");
    });
  });
});
