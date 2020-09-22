import {
  BlockActions,
  BlockHandlerType,
  DocContext,
  HandlerInterface,
  InlineFormatterDummy,
  LexemeDef,
} from "../types";
import { isLineEnd } from "../utils";
import { NAME_DEFAULT } from "../handler-manager";

/**
 * Barebones handler that defaults to <p/>.
 * @todo remove paragraph.ts?
 */
export class DefaultBlock implements HandlerInterface<BlockHandlerType> {
  lastLex: string = "";
  context?: DocContext;
  inlineFormatter = InlineFormatterDummy;

  setContext(context: DocContext) {
    this.context = context;
    this.inlineFormatter = context.getInlineFormatter();
  }

  getName() {
    return NAME_DEFAULT;
  }

  canAccept(lexeme: string) {
    return true;
  }

  buff = "";

  /**
   * Collects lexemes into a paragraph. If the leading lexemes are empty (e.g. all whitespace)
   * or is a newline, `DEFER` is returned to allow for a potentially better handler to pick up.
   *
   * One case to demonstrate where `DEFER` is useful:
   *
   * ```markdown
   * > paragraph1
   * > > paragraph 2
   * > paragraph 3
   * ```
   *
   * @param lexeme
   * @param def
   */
  push(lexeme: string, def?: LexemeDef): BlockActions {
    const lineEnd = isLineEnd(lexeme);
    if (lineEnd && isLineEnd(this.lastLex)) return BlockActions.DONE;
    else if (lineEnd) return BlockActions.DEFER;

    this.buff += lexeme.replace(/^\s+/, "");
    this.lastLex = lexeme;
    this.inlineFormatter.push(lineEnd ? " " : lexeme);
    return this.buff == "" ? BlockActions.DEFER : BlockActions.CONTINUE;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new DefaultBlock();
  }

  toString() {
    return "<p>" + this.inlineFormatter.toString() + "</p>";
  }
}
