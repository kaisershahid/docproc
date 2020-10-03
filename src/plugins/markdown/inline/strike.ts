import { SimpleWrapHandler } from "../../../inline/handlers/simple-wrap";
import {
  HandlerInterface,
  InlineActions,
  InlineHandlerType,
  LexemeDef,
} from "../../../types";

export enum InlineHandlerState {
  start,
  opening,
  opened,
  closing,
  closed,
}

const REGEX_TAG = /^~+$/;

export class StrikeHandler extends SimpleWrapHandler {
  constructor() {
    super("~", "<del>", "</del>");
  }

  canAccept(lexeme: string): boolean {
    return REGEX_TAG.test(lexeme);
  }

  isEnclosingLex(lexeme: string, def?: LexemeDef): boolean {
    return /^~+$/.test(lexeme);
  }

  state = InlineHandlerState.start;

  nextAction(lexeme: string): InlineActions {
    // look here for any future issues around unbalanced tags
    if (this.state == InlineHandlerState.opening) {
      return InlineActions.CONTINUE;
    } else if (this.state == InlineHandlerState.opened) {
      if (this.lastLexEscaped || this.canAccept(lexeme)) {
        return InlineActions.CONTINUE;
      }
      return InlineActions.DEFER;
    } else if (this.state == InlineHandlerState.closing) {
      if (this.canAccept(lexeme)) {
        return InlineActions.CONTINUE;
      }
    }

    return InlineActions.REJECT;
  }

  protected handleEnclosingLex(lexeme: string, def?: LexemeDef): InlineActions {
    if (this.state == InlineHandlerState.start) {
      this.state = InlineHandlerState.opening;
      this.inTag = true;
      return InlineActions.NEST;
    } else if (this.state == InlineHandlerState.opened) {
      this.state = InlineHandlerState.closing;
      return InlineActions.CONTINUE;
    } else if (
      this.state == InlineHandlerState.opening ||
      this.state == InlineHandlerState.closing
    ) {
      if (this.lastLexEscaped) {
        this.words.push(lexeme);
        this.state = InlineHandlerState.opened;
      }

      return InlineActions.CONTINUE;
    }

    return InlineActions.REJECT;
  }

  protected handlePush(lexeme: string, def?: LexemeDef): InlineActions {
    if (this.state == InlineHandlerState.closing) {
      this.state = InlineHandlerState.closed;
      this.inTag = false;
      this.closed = true;
      return InlineActions.REJECT;
    }

    if (this.state == InlineHandlerState.opening) {
      this.state = InlineHandlerState.opened;
    }

    this.words.push(lexeme);
    return InlineActions.CONTINUE;
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new StrikeHandler();
  }
}
