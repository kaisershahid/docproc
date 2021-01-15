/**
 * Processes an input file and outputs to console. Currently only supports Markdown.
 *
 * ```
 * docproc src/index [filePath]
 * ```
 */
import fs from "fs";
import path from "path";
import { getDocProcForFile } from "./index";
import argParser from "./arg-parser";

const args = argParser.parse_args(process.argv.slice(2));
console.log(args);
const filePath = args.input;
if (!fs.existsSync(filePath)) {
	console.error("could not find", filePath);
	process.exit(1);
}

console.log("<  in:", filePath);

const fileParts = filePath.split(".");
const ext = fileParts.pop();
const fileBase = fileParts.join(".");
const { docproc, sourceContext } = getDocProcForFile(filePath);
docproc.process(fs.readFileSync(filePath).toString());

const outDir = args.output_dir ?? sourceContext.basePath;
const outName = args.output ?? sourceContext.baseNameNoExt + ".html";
const fileOut = `${outDir ? outDir + "/" : ""}${outName}`;
fs.writeFileSync(fileOut, docproc.toString());
console.log("> out:", fileOut);
