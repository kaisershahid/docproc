import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
} from "../types";
import { isLineEnd } from "../utils";
import { BlockBase } from "./block-base";
import { DocProcessor } from "../doc-processor";

/**
 * Provides a convenient abstraction to check if lexemes define a nestable block
 * structure (for markdown, this would be blockquotes and list items) by maintaining
 * an internal {@see DocProcessor} to build up the document described in the nesting.
 *
 * In general, maintaining an internal {@see DocProcessor} lets you support the complete
 * document syntax and formatting in any nestable part of the document.
 */
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

  getName(): string {
    throw new Error("not implemented");
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

  isLexemeIndented(lexeme: string, def?: LexemeDef): boolean {
    return false;
  }

  getUnindentedLexeme(lexeme: string, def?: LexemeDef): string {
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
