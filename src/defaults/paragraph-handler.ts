import {
  BlockActions,
  BlockHandlerType,
  DocContext,
  HandlerInterface,
  InlineFormatterDummy,
  LexemeDef,
} from "../types";
import { isLineEnd, isWhitespace, trimString } from "../utils";
import { NAME_DEFAULT } from "../handler-manager";

/**
 * Barebones handler that defaults to <p/>.
 * @todo remove paragraph.ts?
 */
export class ParagraphHandler implements HandlerInterface<BlockHandlerType> {
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
   * @todo there's a minor bug with whitespace from next line being added on to previous element -- see the list.handler
   *       and blockquote.handler test cases with space before </>
   */
  push(lexeme: string, def?: LexemeDef): BlockActions {
    const lineEnd = isLineEnd(lexeme);
    if (lineEnd && isLineEnd(this.lastLex)) return BlockActions.DONE;

    this.buff += lexeme.replace(/^\s+/, "");
    this.lastLex = lexeme;
    this.inlineFormatter.push(lexeme);
    return this.buff == "" || isWhitespace(lexeme)
      ? BlockActions.DEFER
      : BlockActions.CONTINUE;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new ParagraphHandler();
  }

  toString() {
    const content = trimString(this.inlineFormatter.toString());
    return content != "" ? "<p>" + content + "</p>" : "";
  }
}
