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

export class StrikeHandler extends SimpleWrapHandler {
  constructor() {
    super("~", "<del>", "</del>");
  }

  isEnclosingLex(lexeme: string, def?: LexemeDef): boolean {
    return super.isEnclosingLex(lexeme, def);
  }

  state = InlineHandlerState.start;

  nextAction(lexeme: string): InlineActions {
    if (this.state == InlineHandlerState.opening) {
      return InlineActions.CONTINUE;
    } else if (this.state == InlineHandlerState.opened) {
      return InlineActions.DEFER;
    } else if (this.state == InlineHandlerState.closing) {
      if (lexeme == "~") {
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
