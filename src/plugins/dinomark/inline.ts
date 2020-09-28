import {
  BaseLinkHandler,
  Link,
  LinkHandlerState,
} from "../markdown/inline/link";
import { DINO_LEX_INLINE } from "./lexemes";
import {
  DocContext,
  HandlerInterface,
  InlineActions,
  InlineFormatterInterface,
  InlineHandlerType,
  LexemeDef,
} from "../../types";

const getStaticFormatter = (): InlineFormatterInterface & any => {
  const buffer: any[] = [];
  return {
    buffer,
    push: (lexeme: string) => {
      buffer.push(lexeme);
    },
    toJSON() {
      return { type: "static", buffer: [...this.buffer] };
    },
  };
};

export const supportsKeyLookup = (target: any): boolean => {
  return typeof target == "object";
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

export class Var extends Link {
  constructor(params: { url?: InlineFormatterInterface }) {
    super({
      url: params.url ?? getStaticFormatter(),
      text: getStaticFormatter(),
    });
  }

  setToReference(): this {
    super.setToReference();
    this.url = new VarReferenceGetter();
    return this;
  }

  toJSON() {}
}

// @todo VarReferenceAccessor

/**
 * Handles the following dynamic inline markup:
 *
 * ```
 * [][var.name]           # use '.' for sub-keys
 * [](general expression) # not yet supported
 * ```
 */
export class DinoInlineHandler extends BaseLinkHandler {
  constructor() {
    super(DINO_LEX_INLINE);
  }

  getName(): string {
    return "dinomark:inline-linkref";
  }

  getNewLinkInstance(): Link {
    return new Var({});
  }

  protected handleStart(lexeme: string, def?: LexemeDef): InlineActions {
    if (lexeme == this.opener) {
      this.state = LinkHandlerState.text_closed;
      this.link = this.getNewLinkInstance();
      return InlineActions.CONTINUE;
    }

    return InlineActions.REJECT;
  }

  toString(): string {
    return this.link.url.resolveValue(this._context);
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new DinoInlineHandler();
  }
}
