import { DirectiveDefinition, DirectiveHandler } from "./directives";
import { DocProcContext } from "../../types";
import fs from "fs";
import { VarReferenceAccessor } from "./directives.var";
import { DocProcessor } from "../../doc-processor";
import { DataRegistry } from "../../data-registry";

export class DirectiveInclude implements DirectiveHandler {
  static readonly DIRECTIVE: string = "include";

  invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any {
    // @todo support multi-root lookup?
    const rootDir = ctx.vars.sys?.sourceRoot ?? process.cwd();
    const filePath = `${rootDir}/${def.action}`;

    if (!fs.existsSync(filePath)) {
      return;
    }

    return this.processFile(def, ctx, filePath);
  }

  protected processFile(
    def: DirectiveDefinition,
    ctx: DocProcContext,
    filePath: string
  ): any {
    return fs.readFileSync(filePath).toString();
  }
}

export class DirectiveProcess extends DirectiveInclude {
  static readonly DIRECTIVE: string = "process";

  protected processFile(
    def: DirectiveDefinition,
    ctx: DocProcContext,
    filePath: string
  ): any {
    const content = fs.readFileSync(filePath).toString();
    const docproc = new DocProcessor(ctx);
    docproc.process(content);
    return docproc.toString();
  }
}

export class DirectiveExecute extends DirectiveInclude {
  static readonly DIRECTIVE: string = "execute";

  static parseParameters(def: DirectiveDefinition) {
    const [func, ...paramsParts] = (def.parameters == "" || !def.parameters
      ? "execute"
      : def.parameters
    ).split("?");

    const paramsStr = paramsParts.join("?");
    let parameters = {};
    if (paramsStr) {
      try {
        parameters = JSON.parse(paramsStr);
      } catch (e) {}
    }

    return { func, parameters };
  }

  protected processFile(
    def: DirectiveDefinition,
    ctx: DocProcContext,
    filePath: string
  ): any {
    try {
      const { func, parameters } = DirectiveExecute.parseParameters(def);
      const retVal = require(filePath)[func](ctx, def, {
        parameters,
        makeProcessor: (ctxOverride: any): DocProcessor => {
          return new DocProcessor({
            ...ctx,
            dataRegistry: new DataRegistry(),
            vars: {},
            ...(ctxOverride ?? {}),
          });
        },
      });
      if (retVal !== undefined && retVal !== null) {
        return retVal;
      }
    } catch (e) {
      console.error("DirectiveExecute", filePath, def);
      console.error(e);
    }

    return "";
  }
}
