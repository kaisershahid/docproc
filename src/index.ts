/**
 * Processes an input file and outputs to console. Currently only supports Markdown.
 *
 * ```
 * ts-node src/docproc [filePath]
 * ```
 */
import fs from "fs";
import { getDocProcForFile } from "./cli";

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
  console.error("could not find", filePath);
  process.exit(1);
}

const docproc = getDocProcForFile(filePath);
docproc.process(fs.readFileSync(filePath).toString());
process.stdout.write(docproc.toString());
