import { PluginOptions } from "../../types";
import { DocProcessor } from "../../doc-processor";
import { addToLexer } from "./lexdef.commonmark";
import { BlockquoteHandler } from "./blockquote";
import { CodeHandler, CodeIndentedHandler } from "./code";
import { HeaderHandler } from "./header";
import { HorizontalRuleHandler } from "./horizontal-rule";
import { LinkrefParagraphHandler } from "./linkref-paragraph";
import { ListHandler } from "./list";
import { TableHandler } from "./table";
import { ParagraphHandler } from "./paragraph";
import {
  BoldHandler,
  EmphasisHandler,
  ItalicHandler,
  StrongHandler,
} from "./inline/bold-italic";
import { CodeHandler as InlineCodeHandler } from "./inline/code";
import { StrikeHandler } from "./inline/strike";
import { ImageHandler, LinkHandler } from "./inline/link";
import { HtmlBlockHandler } from "./html";
import { HtmlTagHandler } from "./inline/html-tag";

export const registerPlugin = (
  processor: DocProcessor,
  opts?: PluginOptions
) => {
  addToLexer(processor.getLexer(), true);
  const bm = processor.getBlockManager();
  bm.addHandler(new HtmlBlockHandler());
  bm.addHandler(new BlockquoteHandler());
  bm.addHandler(new CodeHandler());
  bm.addHandler(new HeaderHandler());
  bm.addHandler(new HorizontalRuleHandler());
  bm.addHandler(new LinkrefParagraphHandler());
  bm.addHandler(new ListHandler());
  bm.addHandler(new CodeIndentedHandler());
  bm.addHandler(new TableHandler());
  bm.addHandler(new ParagraphHandler());

  const im = processor.getInlineManager();
  im.addHandler(new HtmlTagHandler());
  im.addHandler(new BoldHandler());
  im.addHandler(new ItalicHandler());
  im.addHandler(new StrongHandler());
  im.addHandler(new EmphasisHandler());
  im.addHandler(new InlineCodeHandler());
  im.addHandler(new StrikeHandler());
  im.addHandler(new LinkHandler());
  im.addHandler(new ImageHandler());
};
