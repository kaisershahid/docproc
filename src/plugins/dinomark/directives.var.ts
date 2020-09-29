import fs from "fs";
import {
  AnyMap,
  DocContext,
  InlineFormatterInterface,
  LexemeDef,
} from "../../types";
import { DirectiveDefinition, DirectiveHandler } from "./directives";

export const supportsKeyLookup = (target: any): boolean => {
  return typeof target == "object";
};

export const RestrictedRootKeys: AnyMap = {
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
 * Some root keys are write-protected by default -- see TODO for list.
 */
export class VarReferenceGetter implements InlineFormatterInterface {
  keys: any[] = [""];
  kidx = 0;
  last = "";
  lastEsc = false;

  constructor(keys?: any[]) {
    if (keys) {
      this.keys = keys;
      this.kidx = keys.length - 1;
    }
  }

  push(lexeme: string, def?: LexemeDef) {
    if (lexeme == ".") {
      if (this.lastEsc) {
        this.keys[this.kidx] += lexeme;
      } else {
        this.keys.push("");
        this.kidx++;
      }
    } else if (lexeme !== "\\") {
      this.keys[this.kidx] += lexeme;
    }

    this.last = lexeme;
    this.lastEsc = lexeme == "\\";
  }

  resolveValue(ctx: DocContext & any): any {
    let ptr = ctx.vars ?? {};
    let val: any;
    // all but the last key need to be indexed
    const keys = [...this.keys];
    const last = keys.pop();
    for (const key of keys) {
      ptr = ptr[key];
      if (!supportsKeyLookup(ptr)) {
        return undefined;
      }
    }

    return ptr?.[last];
  }

  toJSON() {
    return { type: "var-ref", keys: [...this.keys] };
  }
}

export class VarReferenceAccessor extends VarReferenceGetter {
  setValue(value: any, ctx: DocContext & any): any {
    if (RestrictedRootKeys[this.keys[0] as string]) {
      return;
    }

    let ptr = ctx.vars;
    const keys = [...this.keys];
    const last = keys.pop();
    for (const key of keys) {
      let newPtr = ptr[key];
      if (!supportsKeyLookup(newPtr)) {
        newPtr = {};
        ptr[key] = newPtr;
      }

      ptr = newPtr;
    }

    ptr[last] = value;
    return value;
  }
}

export class DirectiveVarSet implements DirectiveHandler {
  static readonly DIRECTIVE = "var";
  invokeDirective(def: DirectiveDefinition, ctx: DocContext): any {
    const key = def.action;
    const varAccessor = new VarReferenceAccessor(key.split("."));
    let raw: any = def.parameters ?? "";
    if (raw.startsWith("json:")) {
      raw = JSON.parse(raw.substr(5));
    }
    varAccessor.setValue(raw, ctx);
  }
}

const INCLUDE_DEFAULT_ROOT = "page";
export class DirectiveIncludeVars implements DirectiveHandler {
  static readonly DIRECTIVE = "include-var";
  static readonly ACTION_MERGE = "@merge";

  invokeDirective(def: DirectiveDefinition, ctx: DocContext): any {
    // @todo support multi-root lookup?
    const rootDir = ctx.vars.sys?.sourceRoot ?? process.cwd();
    const filePath = `${rootDir}/${def.action}`;
    if (!fs.existsSync(filePath)) {
      return;
    }

    // @todo support format prefixing, like `urlencode:key=val&...`
    // @todo support def.action == '@merge'
    const content = fs.readFileSync(filePath).toString();
    const root =
      def.parameters == "" ? INCLUDE_DEFAULT_ROOT : (def.parameters as string);
    const varAccessor = new VarReferenceAccessor(root.split("."));
    varAccessor.setValue(JSON.parse(content), ctx);
  }
}
