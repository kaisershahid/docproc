import { PluginOptions } from "..";
import { DocProcessor } from "../../doc-processor";
import { addToLexer } from "./lexdef.commonmark";

export const registerPlugin = (
  processor: DocProcessor,
  opts?: PluginOptions
) => {
  addToLexer(processor.getLexer());
};
