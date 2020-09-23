import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
} from "../types";
import { isLineEnd } from "../utils";
import { BlockBase } from "./block-base";
import { DocProcessor } from "../doc-processor";

export class BlockNestableBase
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  protected static id = 0;
  protected id = 0;

  lastLex: string = "";
  inBlock = false;
  subDoc?: DocProcessor;

  constructor() {
    super();
    this.id = ++BlockNestableBase.id;
  }

  getName() {
    return "not-implemented";
  }

  canAccept(lexeme: string) {
    return false;
  }

  protected getSubDoc(): DocProcessor {
    if (!this.subDoc) {
      this.subDoc = new DocProcessor(this.context);
    }

    return this.subDoc;
  }

  isLexemeIndented(lexeme: string): boolean {
    return false;
  }

  getUnindentedLexeme(lexeme: string): string {
    throw new Error("not implemented");
  }

  protected pushToSubDoc(lexeme: string, def?: LexemeDef) {
    this.getSubDoc().push(lexeme, def);
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    if (this.isLexemeIndented(lexeme)) {
      this.inBlock = true;
      const substr = this.getUnindentedLexeme(lexeme);
      if (substr != "") {
        this.pushToSubDoc(substr, def);
      }
      return BlockActions.CONTINUE;
    } else if (!isLineEnd(lexeme)) {
      if (this.inBlock) {
        this.pushToSubDoc(lexeme, def);
        return BlockActions.CONTINUE;
      } else {
        return BlockActions.REJECT;
      }
    } else {
      if (this.inBlock) {
        this.pushToSubDoc(lexeme, def);
        this.inBlock = false;
        return BlockActions.CONTINUE;
      } else {
        return BlockActions.DONE;
      }
    }
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    throw new Error("not implemented");
  }

  toString() {
    throw new Error("not implemented");
  }
}
