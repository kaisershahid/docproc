import { DirectiveDefinition, DirectiveHandler } from "./directives";
import { DocContext } from "../../types";
import fs from "fs";
import { VarReferenceAccessor } from "./directives.var";
import { DocProcessor } from "../../doc-processor";

export class DirectiveInclude implements DirectiveHandler {
  static readonly DIRECTIVE: string = "include";

  invokeDirective(def: DirectiveDefinition, ctx: DocContext): any {
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
    ctx: DocContext,
    filePath: string
  ) {
    return fs.readFileSync(filePath).toString();
  }
}

export class DirectiveProcess extends DirectiveInclude {
  static readonly DIRECTIVE = "process";

  protected processFile(
    def: DirectiveDefinition,
    ctx: DocContext,
    filePath: string
  ) {
    const content = fs.readFileSync(filePath).toString();
    const docproc = new DocProcessor(ctx);
    docproc.process(content);
    return docproc.toString();
  }
}
