import { InlineHandlerInterface } from "../index";
import {
  DocProcContext,
  HandlerInterface,
  InlineActions,
  InlineHandlerType,
  LexemeDef,
} from "../../types";

export class BaseHandler implements InlineHandlerInterface {
  private _parent: InlineHandlerInterface | null = null;
  private _children: InlineHandlerInterface[] = [];
  protected _context?: DocProcContext;
  protected words: any[] = [];

  constructor() {}

  getChildren(): InlineHandlerInterface[] {
    return this._children;
  }

  addChild(value: HandlerInterface<InlineHandlerType>): InlineHandlerInterface {
    this._children.push(value as InlineHandlerInterface);
    this.words.push(value);
    return this;
  }

  getParent(): InlineHandlerInterface | null {
    return null;
  }

  setParent(parent: InlineHandlerInterface): InlineHandlerInterface {
    this._parent = parent;
    return this;
  }

  setContext(context: DocProcContext): void {
    this._context = context;
  }

  nextAction(lexeme: string): InlineActions {
    return InlineActions.REJECT;
  }

  canAccept(lexeme: string): boolean {
    throw new Error("canAccept() not implemented");
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    throw new Error("cloneInstance() not implemented");
  }

  getName(): string {
    throw new Error("getName() not implemented");
  }

  push(lexeme: string, def: LexemeDef | undefined): any {
    throw new Error("push() not implemented");
  }

  toString() {
    return this.words.join("");
  }
}
