import { InlineActions, InlineHandlerInterface } from "../index";
import { DocContext, HandlerInterface, LexemeDef } from "../../types";
import { BaseHandler } from "./base";

export class DefaultParentHandler extends BaseHandler {
  canAccept(lexeme: string): boolean {
    return false;
  }

  getName(): string {
    return "default";
  }

  push(lexeme: string, def: LexemeDef | undefined): any {
    this.words.push(lexeme);
    return InlineActions.CONTINUE;
  }
}
