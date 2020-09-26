import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import { BlockBase } from "../../defaults/block-base";
import { escapeHtml } from "../../utils_/escape-html";
import { LEXEME_TYPE_WHITESPACE_START } from "./lexdef.lookaheads";

export enum CodeState {
  start,
  langtype,
  in_code,
  end,
}

/**
 * Handle multiline <pre/>.
 */
export class CodeHandler
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  state: CodeState = CodeState.start;
  codeType = "";
  lastLex: string = "";
  lastLexEsc = false;
  buff = "";
  lines: string[] = [];

  protected pushLine() {
    this.lines.push(this.buff);
    this.buff = "";
  }

  getName() {
    return "code";
  }

  canAccept(lexeme: string, def?: LexemeDef) {
    return lexeme == "```";
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    let ret = BlockActions.REJECT;

    if (this.state == CodeState.start) {
      ret = this.handleStart(lexeme, def);
    } else if (this.state == CodeState.langtype) {
      ret = this.handleLangtype(lexeme, def);
    } else if (this.state == CodeState.in_code) {
      ret = this.handleInCode(lexeme, def);
    } else if (this.state == CodeState.end) {
      ret = this.handleEnd(lexeme, def);
    }

    this.lastLex = lexeme;
    this.lastLexEsc = lexeme == "\\";
    return ret;
  }

  protected handleStart(lexeme: string, def?: LexemeDef): BlockActions {
    if (lexeme == "```") {
      this.state = CodeState.langtype;
    }

    return BlockActions.CONTINUE;
  }

  protected handleLangtype(lexeme: string, def?: LexemeDef): BlockActions {
    if (isLineEnd(lexeme)) {
      this.state = CodeState.in_code;
    } else {
      this.codeType += lexeme.replace(/^\s*/, "").replace(/\s*$/, "");
    }

    return BlockActions.CONTINUE;
  }

  protected handleInCode(lexeme: string, def?: LexemeDef): BlockActions {
    if (isLineEnd(this.lastLex) && lexeme == "```") {
      this.state = CodeState.end;
      return BlockActions.DONE;
    }

    if (isLineEnd(lexeme)) {
      this.pushLine();
    } else {
      this.buff += lexeme;
    }

    return BlockActions.CONTINUE;
  }

  protected handleEnd(lexeme: string, def?: LexemeDef): BlockActions {
    return BlockActions.REJECT;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new CodeHandler();
  }

  handlerEnd() {
    if (this.buff != "" && !isLineEnd(this.lastLex)) {
      this.pushLine();
    }
  }

  toString() {
    const codeClass =
      "markdown-block-code" + (this.codeType != "" ? "-" + this.codeType : "");
    return (
      `<pre class="${codeClass}">` +
      escapeHtml(this.lines.join("\n")) +
      "</pre>"
    );
  }
}

export class CodeIndentedHandler extends CodeHandler {
  getName(): string {
    return "code:indented";
  }

  canAccept(lexeme: string, def?: LexemeDef): boolean {
    return lexeme.startsWith("    ");
  }

  protected handleStart(lexeme: string, def?: LexemeDef): BlockActions {
    this.buff += lexeme;
    this.state = CodeState.in_code;
    return BlockActions.CONTINUE;
  }

  protected handleInCode(lexeme: string, def?: LexemeDef): BlockActions {
    if (isLineEnd(lexeme)) {
      if (isLineEnd(this.lastLex)) {
        this.state = CodeState.end;
        return BlockActions.DONE;
      } else {
        this.pushLine();
        return BlockActions.CONTINUE;
      }
    }

    if (
      def?.type == LEXEME_TYPE_WHITESPACE_START &&
      !lexeme.startsWith("    ")
    ) {
      this.state = CodeState.end;
      return BlockActions.REJECT;
    }

    this.buff += lexeme;
    return BlockActions.CONTINUE;
  }

  protected pushLine() {
    this.lines.push(this.buff.substr(4));
    this.buff = "";
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new CodeIndentedHandler();
  }
}
