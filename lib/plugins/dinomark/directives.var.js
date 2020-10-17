"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectiveIncludeVars = exports.DirectiveVarSet = exports.VarReferenceAccessor = exports.VarReferenceGetter = exports.RestrictedRootKeys = exports.supportsKeyLookup = void 0;
const fs_1 = __importDefault(require("fs"));
exports.supportsKeyLookup = (target) => {
    return typeof target == "object";
};
exports.RestrictedRootKeys = {
    sys: "sys",
};
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
class VarReferenceGetter {
    constructor(keys) {
        this.keys = [""];
        this.kidx = 0;
        this.last = "";
        this.lastEsc = false;
        if (keys) {
            this.keys = keys;
            this.kidx = keys.length - 1;
        }
    }
    push(lexeme, def) {
        if (lexeme == ".") {
            if (this.lastEsc) {
                this.keys[this.kidx] += lexeme;
            }
            else {
                this.keys.push("");
                this.kidx++;
            }
        }
        else if (lexeme !== "\\") {
            this.keys[this.kidx] += lexeme;
        }
        this.last = lexeme;
        this.lastEsc = lexeme == "\\";
    }
    resolveValue(ctx) {
        let ptr = ctx.vars ?? {};
        let val;
        // all but the last key need to be indexed
        const keys = [...this.keys];
        const last = keys.pop();
        for (const key of keys) {
            ptr = ptr[key];
            if (!exports.supportsKeyLookup(ptr)) {
                return undefined;
            }
        }
        return ptr?.[last];
    }
    toJSON() {
        return { type: "var-ref", keys: [...this.keys] };
    }
}
exports.VarReferenceGetter = VarReferenceGetter;
class VarReferenceAccessor extends VarReferenceGetter {
    setValue(value, ctx) {
        if (exports.RestrictedRootKeys[this.keys[0]]) {
            return;
        }
        let ptr = ctx.vars;
        const keys = [...this.keys];
        const last = keys.pop();
        for (const key of keys) {
            let newPtr = ptr[key];
            if (!exports.supportsKeyLookup(newPtr)) {
                newPtr = {};
                ptr[key] = newPtr;
            }
            ptr = newPtr;
        }
        ptr[last] = value;
        return value;
    }
    static setVarInContext(varName, value, context) {
        const acc = new VarReferenceAccessor(varName.split("."));
        acc.setValue(value, context);
        return acc;
    }
}
exports.VarReferenceAccessor = VarReferenceAccessor;
class DirectiveVarSet {
    invokeDirective(def, ctx) {
        const key = def.action;
        const varAccessor = new VarReferenceAccessor(key.split("."));
        let raw = def.parameters ?? "";
        if (raw.startsWith("json:")) {
            raw = JSON.parse(raw.substr(5));
        }
        varAccessor.setValue(raw, ctx);
    }
}
exports.DirectiveVarSet = DirectiveVarSet;
DirectiveVarSet.DIRECTIVE = "var";
const INCLUDE_DEFAULT_ROOT = "page";
class DirectiveIncludeVars {
    invokeDirective(def, ctx) {
        // @todo support multi-root lookup?
        const rootDir = ctx.vars.sys?.sourceRoot ?? process.cwd();
        const filePath = `${rootDir}/${def.action}`;
        if (!fs_1.default.existsSync(filePath)) {
            return;
        }
        // @todo support format prefixing, like `urlencode:key=val&...`
        // @todo support def.action == '@merge'
        const content = fs_1.default.readFileSync(filePath).toString();
        const root = def.parameters == "" ? INCLUDE_DEFAULT_ROOT : def.parameters;
        const varAccessor = new VarReferenceAccessor(root.split("."));
        varAccessor.setValue(JSON.parse(content), ctx);
    }
}
exports.DirectiveIncludeVars = DirectiveIncludeVars;
DirectiveIncludeVars.DIRECTIVE = "include-var";
DirectiveIncludeVars.ACTION_MERGE = "@merge";
