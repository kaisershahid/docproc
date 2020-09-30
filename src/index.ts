/**
 * Processes an input file and outputs to console. Currently only supports Markdown.
 *
 * ```
 * ts-node src/docproc [filePath]
 * ```
 */
import fs from "fs";
import { getDocProcForFile } from "./cli";
// import { DocProcessor } from "./doc-processor";
// import { registerPlugin } from "./plugins/markdown";
//
// const docproc = new DocProcessor();
// const plugins = docproc.getPluginManager();
//
// plugins.registerFromModule("markdown", "./plugins/markdown");
// plugins.registerFromModule("dinomark", "./plugins/dinomark");
// plugins.attach("markdown", docproc);
// plugins.attach("dinomark", docproc);

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
  console.error("could not find", filePath);
  process.exit(1);
}

const docproc = getDocProcForFile(filePath);
docproc.process(fs.readFileSync(filePath).toString());
// console.log(docproc.toString());
