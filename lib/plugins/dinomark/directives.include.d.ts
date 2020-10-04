import { DirectiveDefinition, DirectiveHandler } from "./directives";
import { DocProcContext } from "../../types";
export declare class DirectiveInclude implements DirectiveHandler {
    static readonly DIRECTIVE: string;
    invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any;
    protected processFile(def: DirectiveDefinition, ctx: DocProcContext, filePath: string): any;
}
export declare class DirectiveProcess extends DirectiveInclude {
    static readonly DIRECTIVE: string;
    protected processFile(def: DirectiveDefinition, ctx: DocProcContext, filePath: string): any;
}
export declare class DirectiveExecute extends DirectiveInclude {
    static readonly DIRECTIVE: string;
    static parseParameters(def: DirectiveDefinition): {
        func: string;
        parameters: {};
    };
    protected processFile(def: DirectiveDefinition, ctx: DocProcContext, filePath: string): any;
}
