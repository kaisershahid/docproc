import { expect } from "chai";
import { detectTabs } from "./utils";

describe("utils", () => {
	describe("detectTabs", () => {
		it("detects 2 tabs", () => {
			const tab = detectTabs("\t\t    hello");
			expect(tab).to.deep.equal({ char: "\t", tabs: 2 });
		});
		it("detects 1 tab as space*4", () => {
			const tab = detectTabs("     hello");
			expect(tab).to.deep.equal({ char: "    ", tabs: 1 });
		});
		it("detects 2 tabs as space*2", () => {
			const tab = detectTabs("     hello", 2);
			expect(tab).to.deep.equal({ char: "  ", tabs: 2 });
		});
	});
});
