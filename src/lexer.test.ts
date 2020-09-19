import { expect } from "chai";
import { Lexer } from "./lexer";

describe("Lexer", () => {
	const subject = new Lexer();
	subject.setLexeme("#", { priority: 100, upTo: 6 });
	let tokens: string[] = [];
	let collector = (token: string) => {
		tokens.push(token);
	};

	beforeEach(() => {
		tokens = [];
	});

	it("detects #", () => {
		subject.lex("# hello", collector);
		expect(tokens).to.deep.equal(["#", " hello"]);
	});
	it("detects # with repeat", () => {
		subject.lex("#### hello", collector);
		expect(tokens).to.deep.equal(["####", " hello"]);
	});
	it("detects ~~ and ~ through prioritization", () => {
		subject.setLexeme("~", { priority: 99 });
		subject.setLexeme("~~", { priority: 100 });
		subject.lex("~~~ hello", collector);
		expect(tokens).to.deep.equal(["~~", "~", " hello"]);
	});
	it("detects ~~~ through prioritization/repeat", () => {
		subject.setLexeme("~", { priority: 100, upTo: 3 });
		subject.setLexeme("~~", { priority: 99 });
		subject.lex("~~~ hello", collector);
		expect(tokens).to.deep.equal(["~~~", " hello"]);
	});
	it.only("handles lookahead appropriately", () => {
		const document = "[@declaration]: hello";
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
		subject.lex(document, collector);
		expect(tokens).to.deep.equal(["[@declaration", "]: hello"]);
	});
});
