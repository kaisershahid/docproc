import { InlineHandlerInterface } from "../index";
import {
  DocProcContext,
  HandlerInterface,
  InlineActions,
  LexemeDef,
} from "../../types";
import { BaseHandler } from "./base";
import { returnUnescapedString } from "../../utils";

/**
 * Used to collect tokens for plaintext output.
 */
export class DefaultParentHandler extends BaseHandler {
  canAccept(lexeme: string): boolean {
    return false;
  }

  getName(): string {
    return "default";
  }

  push(lexeme: string, def: LexemeDef | undefined): any {
    this.words.push(returnUnescapedString(lexeme));
    return InlineActions.CONTINUE;
  }
}
