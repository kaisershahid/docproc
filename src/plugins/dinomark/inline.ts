import {
  BaseLinkHandler,
  Link,
  LinkHandlerState,
} from "../markdown/inline/link";
import { DINO_LEX_INLINE } from "./lexemes";
import {
  HandlerInterface,
  InlineActions,
  InlineFormatterInterface,
  InlineHandlerType,
  LexemeDef,
} from "../../types";
import { VarReferenceGetter } from "./directives.var";

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
