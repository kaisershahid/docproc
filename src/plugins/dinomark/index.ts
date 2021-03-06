import { DocProcessor } from "../../doc-processor";
import { PluginOptions } from "../../types";
import { addToLexer } from "./lexemes";
import { DinoBlockHandler } from "./block";
import { DinoInlineHandler } from "./inline";
import { DirectivesManager, DINOMARK_SERVICE_DIRECTIVE } from "./directives";
import { DirectiveIncludeVars, DirectiveVarSet } from "./directives.var";
import {
  DirectiveExecute,
  DirectiveInclude,
  DirectiveProcess,
} from "./directives.include";
import {
  DirectiveCaptureEnd,
  DirectiveCaptureStart,
} from "./directive-handlers/capture";

export const registerPlugin = (doc: DocProcessor, opts?: PluginOptions) => {
  const pluginSvc = doc.getPluginServiceManager();
  const directiveManager = new DirectivesManager();
  pluginSvc.addService(
    "dinomark",
    DINOMARK_SERVICE_DIRECTIVE,
    directiveManager
  );
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
  directiveManager.addHandler(new DirectiveExecute(), {
    directive: DirectiveExecute.DIRECTIVE,
  });
  directiveManager.addHandler(new DirectiveCaptureStart(), {
    directive: DirectiveCaptureStart.DIRECTIVE,
  });
  directiveManager.addHandler(new DirectiveCaptureEnd(), {
    directive: DirectiveCaptureEnd.DIRECTIVE,
  });

  // @todo register directives in opts

  addToLexer(doc.getLexer());
  doc
    .getBlockManager()
    .addHandler(new DinoBlockHandler(), { before: "linkref-paragraph" });
  doc.getInlineManager().addHandler(new DinoInlineHandler(), { before: "top" });
};
