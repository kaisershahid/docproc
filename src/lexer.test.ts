import { expect } from "chai";
import { Lexer } from "./lexer";

describe("Lexer", () => {
	const subject = new Lexer();
	let tokens: string[] = [];
	let collector = (token: string) => {
		tokens.push(token);
	};

	beforeEach(() => {
		tokens = [];
	});

	it("detects #", () => {
		subject.parse("# hello", collector);
		expect(tokens).to.deep.equal(["#", " hello"]);
	});
	it("detects # with repeat", () => {
		subject.parse("#### hello", collector);
		expect(tokens).to.deep.equal(["####", " hello"]);
	});
	it("detects ~~ and ~ through prioritization", () => {
		subject.setLexeme("~", { priority: 99 });
		subject.setLexeme("~~", { priority: 100 });
		subject.parse("~~~ hello", collector);
		expect(tokens).to.deep.equal(["~~", "~", " hello"]);
	});
	it("detects ~~~ through prioritization/repeat", () => {
		subject.setLexeme("~", { priority: 100, upTo: 3 });
		subject.setLexeme("~~", { priority: 99 });
		subject.parse("~~~ hello", collector);
		expect(tokens).to.deep.equal(["~~~", " hello"]);
	});
});
