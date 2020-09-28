import { DocProcessor } from "../../doc-processor";
import { PluginOptions } from "../index";
import { addToLexer } from "./lexemes";
import { DinoBlockHandler } from "./block";
import { DinoInlineHandler } from "./inline";

export const registerPlugin = (doc: DocProcessor, opts?: PluginOptions) => {
  addToLexer(doc.getLexer());
  doc
    .getBlockManager()
    .addHandler(new DinoBlockHandler(), { before: "linkref-paragraph" });
  doc.getInlineManager().addHandler(new DinoInlineHandler(), { before: "top" });
};
