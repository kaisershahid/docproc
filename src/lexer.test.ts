import { expect } from "chai";
import { Lexer } from "./lexer";
import { LEXEME_COMPLETE } from "./types";

describe("Lexer", () => {
  const subject = new Lexer();

  let tokens: string[] = [];
  let collector = (token: string) => {
    if (token === LEXEME_COMPLETE) return;
    tokens.push(token);
  };

  beforeEach(() => {
    subject.reset();
    tokens = [];
  });

  describe("baseline lexing", () => {
    [
      { str: "abc123", exp: ["abc123"] },
      { str: "abc 123", exp: ["abc", " ", "123"] },
    ].forEach(({ str, exp }) => {
      it(`detects words and number: ${str}`, () => {
        subject.lex(str, collector);
        expect(tokens).to.deep.equal(exp);
      });
    });

    it("handles boundaries around alpha-numeric strings", () => {
      subject.reset();
      subject.lex("abc\n123\n>abc123", collector);
      expect(tokens).to.deep.equal(["abc", "\n", "123", "\n>", "abc123"]);
    });
  });

  describe("with additional lexemes", () => {
    subject.setLexeme("#", { priority: 100, upTo: 6 });
    subject.setLexeme("[@", {
      priority: 1,
      lookahead: (content, lex, i): any => {
        const substr = content.substr(i, "declaration".length);
        if (substr == "declaration") {
          return {
            nextIndex: i + substr.length,
            newLexeme: lex + substr,
          };
        }
      },
    });

    it("detects #", () => {
      subject.lex("# hello", collector);
      subject.complete(collector).complete(collector);
      expect(tokens).to.deep.equal(["#", " ", "hello"]);
    });
    it("handles \\#", () => {
      subject.lex("\\# hello", collector);
      subject.complete(collector).complete(collector);
      expect(tokens).to.deep.equal(["\\#", " ", "hello"]);
    });
    it("detects # with repeat", () => {
      subject.lex("#### hello", collector).complete(collector);
      expect(tokens).to.deep.equal(["####", " ", "hello"]);
    });
    it("detects ~~ and ~ through prioritization", () => {
      subject.setLexeme("~", { priority: 99 });
      subject.setLexeme("~~", { priority: 100 });
      subject.lex("~~~ hello", collector).complete(collector);
      expect(tokens).to.deep.equal(["~~", "~", " ", "hello"]);
    });
    it("detects ~~~ through prioritization/repeat", () => {
      subject.setLexeme("~", { priority: 100, upTo: 3 });
      subject.setLexeme("~~", { priority: 99 });
      subject.lex("~~~ hello", collector).complete(collector);
      expect(tokens).to.deep.equal(["~~~", " ", "hello"]);
    });
    it("detects '[@declaration'", () => {
      const document = "[@declaration]: hello";
      subject.lex(document, collector).complete(collector);
      expect(tokens).to.deep.equal(["[@declaration", "]: ", "hello"]);
    });
  });

  describe("numberDefinition()", () => {
    it("detects natural number", () => {
      subject.lex("1234", collector);
      expect(tokens[0]).to.equal("1234");
    });
    it("detects fractional", () => {
      subject.lex("1.53 sdf", collector);
      expect(tokens[0]).to.equal("1.53");
    });
    it.skip("detects hexadecimal", () => {
      subject.lex("5x0efg9 sdf", collector);
      expect(tokens[0]).to.equal("5x0ef");
    });
    it("detects exponent", () => {
      subject.lex("7e-5 sdf", collector);
      expect(tokens[0]).to.equal("7e-5");
    });
    it("detects exponent with fractional base", () => {
      subject.lex("7.4e-5 sdf", collector);
      expect(tokens[0]).to.equal("7.4e-5");
    });
    it("detects exponent with fractional power", () => {
      subject.lex("7e-5.3 sdf", collector);
      expect(tokens[0]).to.equal("7e-5.3");
    });
    it("detects exponent with fractional base and power", () => {
      subject.lex("-7.4e-5.3 sdf", collector);
      expect(tokens[1]).to.equal("7.4e-5.3");
    });
  });
});
