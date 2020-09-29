import { DocProcessor } from "../../doc-processor";
import { PluginOptions } from "../index";
import { addToLexer } from "./lexemes";
import { DinoBlockHandler, KEY_PROVIDER_DIRECTIVE } from "./block";
import { DinoInlineHandler } from "./inline";
import { DirectivesManager } from "./directives";
import { DirectiveIncludeVars, DirectiveVarSet } from "./directives.var";
import { DirectiveInclude, DirectiveProcess } from "./directives.include";

export const registerPlugin = (doc: DocProcessor, opts?: PluginOptions) => {
  const directiveManager = new DirectivesManager();
  doc.vars[KEY_PROVIDER_DIRECTIVE] = directiveManager;
  directiveManager.addHandler(new DirectiveVarSet(), {
    directive: DirectiveVarSet.DIRECTIVE,
  });
  directiveManager.addHandler(new DirectiveIncludeVars(), {
    directive: DirectiveIncludeVars.DIRECTIVE,
  });
  directiveManager.addHandler(new DirectiveInclude(), {
    directive: DirectiveInclude.DIRECTIVE,
  });
  directiveManager.addHandler(new DirectiveProcess(), {
    directive: DirectiveProcess.DIRECTIVE,
  });
  // @todo register core directives
  // @todo register directives in opts

  addToLexer(doc.getLexer());
  doc
    .getBlockManager()
    .addHandler(new DinoBlockHandler(), { before: "linkref-paragraph" });
  doc.getInlineManager().addHandler(new DinoInlineHandler(), { before: "top" });
};
