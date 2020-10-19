/**
 * Processes an input file and outputs to console. Currently only supports Markdown.
 *
 * ```
 * ts-node src/index [filePath]
 * ```
 */
import fs from "fs";
import path from "path";
import { getDocProcForFile } from "./cli";

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
  console.error("could not find", filePath);
  process.exit(1);
}

console.log("< in:", filePath);

const fileParts = filePath.split(".");
const ext = fileParts.pop();
const fileBase = fileParts.join(".");
const { docproc, sourceContext } = getDocProcForFile(filePath);
docproc.process(fs.readFileSync(filePath).toString());

const fileOut = `${sourceContext.basePath ? sourceContext.basePath + "/" : ""}${
  sourceContext.baseNameNoExt
}.html`;
fs.writeFileSync(fileOut, docproc.toString());
console.log("> out:", fileOut);
