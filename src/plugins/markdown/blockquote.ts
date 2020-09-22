import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import { BlockBase } from "./block-base";
import { DocProcessor } from "../../doc-processor";

export class BlockquoteHandler
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  protected static id = 0;
  protected id = 0;
  lastLex: string = "";
  inBlock = false;
  subDoc?: DocProcessor;

  constructor() {
    super();
    this.id = ++BlockquoteHandler.id;
  }

  getName() {
    return "blockquote";
  }

  canAccept(lexeme: string) {
    return lexeme[0] == ">";
  }

  getSubDoc(): DocProcessor {
    if (!this.subDoc) {
      this.subDoc = new DocProcessor(this.context);
    }

    return this.subDoc;
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    if (lexeme[0] == ">") {
      this.inBlock = true;
      const substr = lexeme.substr(1).replace(/^\s+/, "");
      if (substr != "") {
        this.getSubDoc().push(substr, def);
      }
      return BlockActions.CONTINUE;
    } else if (!isLineEnd(lexeme)) {
      if (this.inBlock) {
        this.getSubDoc().push(lexeme, def);
        return BlockActions.CONTINUE;
      } else {
        return BlockActions.REJECT;
      }
    } else {
      if (this.inBlock) {
        this.getSubDoc().push(lexeme, def);
        this.inBlock = false;
        return BlockActions.CONTINUE;
      } else {
        return BlockActions.DONE;
      }
    }
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new BlockquoteHandler();
  }

  toString() {
    return "<blockquote>" + this.subDoc?.toString() + "</blockquote>";
  }
}
