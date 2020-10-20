import { AnyMap, DocProcContext, InlineFormatterInterface, LexemeDef } from "../../types";
import { DirectiveDefinition, DirectiveHandler } from "./directives";
export declare const supportsKeyLookup: (target: any) => boolean;
export declare const RestrictedRootKeys: AnyMap;
/**
 * Receives lexemes to build a set of keys delimited with `.` -- these
 * keys are used to look up or set values in the context `vars` shared map.
 *
 * Examples:
 *
 * - `key.subkey` gets translated as `['key', 'subkey']'
 * - `key.subkey with \.` gets translated as `['key', 'subkey with .']`
 *
 * Some root keys are write-protected by default -- see {@see RestrictedRootKeys} for list.
 */
export declare class VarReferenceGetter implements InlineFormatterInterface {
    keys: any[];
    kidx: number;
    last: string;
    lastEsc: boolean;
    constructor(keys?: any[]);
    push(lexeme: string, def?: LexemeDef): void;
    resolveValue(ctx: DocProcContext & any): any;
    toJSON(): {
        type: string;
        keys: any[];
    };
}
export declare class VarReferenceAccessor extends VarReferenceGetter {
    setValue(value: any, ctx: DocProcContext & any): any;
    static setVarInContext(varName: string, value: any, context: DocProcContext): VarReferenceAccessor;
}
export declare class DirectiveVarSet implements DirectiveHandler {
    static readonly DIRECTIVE = "var";
    invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any;
}
export declare class DirectiveIncludeVars implements DirectiveHandler {
    static readonly DIRECTIVE = "include-var";
    static readonly ACTION_MERGE = "@merge";
    invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any;
}
