import { DirectiveDefinition, DirectiveHandler } from "./directives";
import { DocProcContext } from "../../types";
import fs from "fs";
import { VarReferenceAccessor } from "./directives.var";
import { DocProcessor } from "../../doc-processor";

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

  protected processFile(
    def: DirectiveDefinition,
    ctx: DocProcContext,
    filePath: string
  ): any {
    try {
      const retVal = require(filePath).execute(ctx, def);
      if (retVal !== undefined && retVal !== null) {
        return retVal;
      }
    } catch (e) {
      // @todo log exception somewhere
    }

    return "";
  }
}
