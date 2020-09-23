import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import { BlockBase } from "../../defaults/block-base";

/**
 * Handle multiline <pre/>.
 * @todo remove paragraph.ts?
 */
export class CodeHandler extends BlockBase {
  opener = "";
  isOpenerSpace = false;
  lastLex: string = "";
  buff = "";
  codeType = "text";
  codeTypeSet = false;
  lines: string[] = [];

  getName() {
    return "code";
  }

  canAccept(lexeme: string, def?: LexemeDef) {
    return lexeme == "```" || lexeme == "    ";
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    let ret = BlockActions.REJECT;
    if (this.opener == "") {
      this.opener = lexeme;
      this.isOpenerSpace = lexeme[0] != "`";
      this.codeTypeSet = this.isOpenerSpace;
      ret = BlockActions.CONTINUE;
    } else if (isLineEnd(lexeme)) {
      if (isLineEnd(this.lastLex) && this.isOpenerSpace) {
        ret = BlockActions.DONE;
      } else {
        if (!this.codeTypeSet) {
          this.codeTypeSet = true;
          if (this.buff !== "") {
            this.codeType = this.buff;
          }
        } else {
          this.lines.push(this.buff);
        }

        this.buff = "";
        ret = BlockActions.CONTINUE;
      }
    } else if (lexeme === "```" && !this.isOpenerSpace) {
      if (this.buff != "") {
        this.lines.push(this.buff);
      }
      ret = BlockActions.DONE;
    } else {
      if (isLineEnd(this.lastLex) && this.isOpenerSpace) {
        const start = lexeme.substr(0, 4);
        const rem = lexeme.substr(4);
        if (start == "    ") {
          if (rem != "") {
            this.buff += rem;
          }
          ret = BlockActions.CONTINUE;
        } else {
          // not idented enough; push remaining buffer and end
          this.lines.push(this.buff);
        }
      } else {
        this.buff += lexeme;
        ret = BlockActions.CONTINUE;
      }
    }

    this.lastLex = lexeme;
    return ret;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new CodeHandler();
  }

  toString() {
    // document ended with this block and didn't force last buffer into lines
    if (this.buff != "" && !isLineEnd(this.lastLex)) {
      this.lines.push(this.buff);
      this.buff = "";
    }

    const codeClass =
      "markdown-block-code" + (this.codeType != "" ? "-" + this.codeType : "");
    return `<pre class="${codeClass}">` + this.lines.join("\n") + "</pre>";
  }
}
