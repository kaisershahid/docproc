/**
 * Processes an input file and outputs to console. Currently only supports Markdown.
 *
 * ```
 * ts-node src/docproc [filePath]
 * ```
 */
import fs from "fs";
import { DocProcessor } from "./doc-processor";
import { registerPlugin } from "./plugins/markdown";

const docproc = new DocProcessor();
registerPlugin(docproc);

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
  console.error("could not find", filePath);
  process.exit(1);
}

docproc.process(fs.readFileSync(filePath).toString());
console.log(docproc.toString());
