import { HandlerManager } from "./handler-manager";
import {
  AnyMap,
  BlockHandlerType,
  HandlerInterface,
  HandlerManagerInterface,
  LexemeConsumer,
  LexemeDef,
  StateInterface,
} from "./types";

export class Parser implements StateInterface {
  vars: AnyMap = {};
  protected cur: HandlerInterface<BlockHandlerType> | undefined;

  push(lex: string, def: LexemeDef | undefined) {
    if (!this.cur) {
      throw new Error("no current handler set");
    }

    return this.cur.push(lex, def);
  }

  getCurrentHandler(): HandlerInterface<BlockHandlerType> | undefined {
    return this.cur;
  }

  setCurrentHandler(handler?: HandlerInterface<BlockHandlerType>) {
    this.cur = handler;
  }
}
