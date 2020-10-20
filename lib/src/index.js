"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Processes an input file and outputs to console. Currently only supports Markdown.
 *
 * ```
 * ts-node src/index [filePath]
 * ```
 */
const fs_1 = __importDefault(require("fs"));
const cli_1 = require("./cli");
const arg_parser_1 = __importDefault(require("./cli/arg-parser"));
const args = arg_parser_1.default.parse_args(process.argv.slice(2));
console.log(args);
const filePath = args.input;
if (!fs_1.default.existsSync(filePath)) {
    console.error("could not find", filePath);
    process.exit(1);
}
console.log("<  in:", filePath);
const fileParts = filePath.split(".");
const ext = fileParts.pop();
const fileBase = fileParts.join(".");
const { docproc, sourceContext } = cli_1.getDocProcForFile(filePath);
docproc.process(fs_1.default.readFileSync(filePath).toString());
const outDir = args.output_dir ?? sourceContext.basePath;
const outName = args.output ?? sourceContext.baseNameNoExt + ".html";
const fileOut = `${outDir ? outDir + "/" : ""}${outName}`;
fs_1.default.writeFileSync(fileOut, docproc.toString());
console.log("> out:", fileOut);
