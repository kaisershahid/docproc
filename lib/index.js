"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Processes an input file and outputs to console. Currently only supports Markdown.
 *
 * ```
 * ts-node src/docproc [filePath]
 * ```
 */
const fs_1 = __importDefault(require("fs"));
const cli_1 = require("./cli");
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
if (!fs_1.default.existsSync(filePath)) {
    console.error("could not find", filePath);
    process.exit(1);
}
const docproc = cli_1.getDocProcForFile(filePath);
docproc.process(fs_1.default.readFileSync(filePath).toString());
console.log(docproc.toString());
