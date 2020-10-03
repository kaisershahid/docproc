"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugin = void 0;
const lexemes_1 = require("./lexemes");
const block_1 = require("./block");
const inline_1 = require("./inline");
const directives_1 = require("./directives");
const directives_var_1 = require("./directives.var");
const directives_include_1 = require("./directives.include");
exports.registerPlugin = (doc, opts) => {
    const pluginSvc = doc.getPluginServiceManager();
    const directiveManager = new directives_1.DirectivesManager();
    doc.vars[directives_1.DINOMARK_SERVICE_DIRECTIVE] = directiveManager;
    pluginSvc.addService("dinomark", directives_1.DINOMARK_SERVICE_DIRECTIVE, directiveManager);
    directiveManager.addHandler(new directives_var_1.DirectiveVarSet(), {
        directive: directives_var_1.DirectiveVarSet.DIRECTIVE,
    });
    directiveManager.addHandler(new directives_var_1.DirectiveIncludeVars(), {
        directive: directives_var_1.DirectiveIncludeVars.DIRECTIVE,
    });
    directiveManager.addHandler(new directives_include_1.DirectiveInclude(), {
        directive: directives_include_1.DirectiveInclude.DIRECTIVE,
    });
    directiveManager.addHandler(new directives_include_1.DirectiveProcess(), {
        directive: directives_include_1.DirectiveProcess.DIRECTIVE,
    });
    directiveManager.addHandler(new directives_include_1.DirectiveExecute(), {
        directive: directives_include_1.DirectiveExecute.DIRECTIVE,
    });
    // @todo register directives in opts
    lexemes_1.addToLexer(doc.getLexer());
    doc
        .getBlockManager()
        .addHandler(new block_1.DinoBlockHandler(), { before: "linkref-paragraph" });
    doc.getInlineManager().addHandler(new inline_1.DinoInlineHandler(), { before: "top" });
};
