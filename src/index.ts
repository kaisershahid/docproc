import fs from "fs";
import MarkdownIt from "markdown-it";
import { Lexer } from "./lexer";
import { bind } from "./plugins/vars";

const [runtime, source, ...args] = process.argv;
const filePath = args.pop() ?? "";

if (!fs.existsSync(filePath)) {
	console.error(`not found: ${filePath}`);
	process.exit(1);
}

// const md = new MarkdownIt();
// bind(md);

// const output = md.render(fs.readFileSync(filePath).toString());
// console.log(output);

const md = new Lexer();
md.lex(fs.readFileSync(filePath).toString(), (token) => {
	console.log("--", JSON.stringify(token));
});
