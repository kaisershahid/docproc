import { ParagraphHandler } from "./paragraph";
import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  LexemeDef,
  LexemePair,
} from "../../types";
import { isLineEnd, isWhitespace } from "../../utils";

export enum LinkrefState {
  start,
  key_open,
  key_closed,
  semicolon_found,
  url_open,
  url_closed,
  comment_open,
  comment_closed,
}

export class Linkref {
  key = "";
  url = "";
  comment = "";
}

const dummyLinkref = new Linkref();

const linkrefRegistry: { [key: string]: Linkref } = {};

export const addLinkrefToRegistry = (ref: Linkref) => {
  linkrefRegistry[ref.key] = ref;
};

export const getLinkrefByKey = (key: string): Linkref | undefined =>
  linkrefRegistry[key];

/**
 * This version of the paragraph handles consecutive lines structured as:
 *
 * ```markdown
 * [key1]: link
 * [key2]: link (comment (\) escaped closing parenthesis supported here but not part of spec)
 * ```
 *
 * If a line doesn't start with `[` it's rejected but any previously found links
 * are registered. If the reference starts but doesn't conform to syntax, the entire
 * block is reverted to a normal paragraph.
 */
export class LinkrefParagraphHandler extends ParagraphHandler {
  getName(): string {
    return "linkref-paragraph";
  }

  inGoodShape = true;
  lastLexEsc = false;

  linkref: Linkref = dummyLinkref;
  linkrefs: Linkref[] = [];

  lineBuff: LexemePair[] = [];
  refState: LinkrefState = LinkrefState.start;

  canAccept(lexeme: string): boolean {
    return lexeme == "[";
  }

  push(lexeme: string, def?: LexemeDef): BlockActions {
    if (isLineEnd(lexeme)) {
      if (isLineEnd(this.lastLex)) {
        this.lineBuff = [];
        return BlockActions.DONE;
      } else {
        this.refState = LinkrefState.start;
        this.lastLex = lexeme;
        this.lastLexEsc = false;
        return BlockActions.CONTINUE;
      }
    } else if (lexeme == "\\") {
      this.lastLex = lexeme;
      this.lastLexEsc = true;
      return BlockActions.CONTINUE;
    } else if (!this.inGoodShape) {
      let ret = super.push(lexeme, def);
      return ret == BlockActions.DONE
        ? BlockActions.DONE
        : BlockActions.CONTINUE;
    }

    this.lineBuff.push({ lexeme, def });

    let ret = this.handleStates(lexeme, def);

    this.lastLex = lexeme;
    this.lastLexEsc = lexeme[0] == "\\";
    return ret;
  }

  /**
   * State transitions overview:
   *
   * ```
   * start: '^\[' -> key_open                  # expect '[
   * key_open: '[^\]]*\]' -> key_closed          # also accepts '\\]'; build key close at ']'
   * key_closed: ':' -> semicolon_found        # expect ':'
   * semicolon_found: '[^\s]+' -> url_open     # build url with non-whitespaces
   * url_open: '[^\s]*' -> url_closed          # whitespace ends url
   * url_closed: '\(' -> comment_open          # open parenthesis starts comment
   * comment_open: '[^)]*\)' -> comment_closed # also accepts '\\)'; build comment and close at ')'
   * ```
   * @param lexeme
   * @param def
   * @protected
   */
  protected handleStates(lexeme: string, def?: LexemeDef): BlockActions {
    let ret: BlockActions = BlockActions.REJECT;
    switch (this.refState) {
      case LinkrefState.start:
        ret = this.handleStart(lexeme, def);
        break;
      case LinkrefState.key_open:
        ret = this.handleKeyOpen(lexeme, def);
        break;
      case LinkrefState.key_closed:
        ret = this.handleKeyClosed(lexeme, def);
        break;
      case LinkrefState.semicolon_found:
        ret = this.handleSemicolonFound(lexeme, def);
        break;
      case LinkrefState.url_open:
        ret = this.handleUrlOpen(lexeme, def);
        break;
      case LinkrefState.url_closed:
        ret = this.handleUrlClosed(lexeme, def);
        break;
      case LinkrefState.comment_open:
        ret = this.handleCommentOpen(lexeme, def);
        break;
      case LinkrefState.comment_closed:
        ret = this.handleCommentClosed(lexeme, def);
        break;
    }
    return ret;
  }

  /**
   * Commit the current linkref if we're not falling back to paragraph.
   */
  handlerEnd() {
    // @todo figure out why ` && this.refState >= LinkrefState.url_closed` is making this fail
    if (this.inGoodShape) {
      addLinkrefToRegistry(this.linkref);
      this.linkrefs.push(this.linkref);
      this.lineBuff = [];
    }
  }

  /**
   * Badly structured link ref on a line, so undo everything ;(
   * @protected
   */
  protected notInGoodShape() {
    this.inGoodShape = false;
    this.lineBuff.forEach(({ lexeme, def }) => {
      super.push(lexeme, def);
    });
    this.lineBuff = [];
  }

  protected handleStart(lexeme: string, def?: LexemeDef): BlockActions {
    const lastLineEnd = isLineEnd(this.lastLex);
    if (this.lastLex == "" || lastLineEnd) {
      // starting new line, so commit last ref
      if (lastLineEnd) {
        this.handlerEnd();
      }

      if (lexeme == "[") {
        this.refState = LinkrefState.key_open;
        this.linkref = new Linkref();
        return BlockActions.CONTINUE;
      }
    }

    return BlockActions.REJECT;
  }

  protected handleKeyOpen(lexeme: string, def?: LexemeDef): BlockActions {
    if (isLineEnd(lexeme)) {
      this.notInGoodShape();
    } else if (lexeme !== "]" || this.lastLexEsc) {
      this.linkref.key += lexeme;
    } else if (lexeme === "]") {
      this.refState = LinkrefState.key_closed;
    }

    return BlockActions.CONTINUE;
  }

  protected handleKeyClosed(lexeme: string, def?: LexemeDef): BlockActions {
    if (lexeme == ":") {
      this.refState = LinkrefState.semicolon_found;
    } else {
      this.notInGoodShape();
    }

    return BlockActions.CONTINUE;
  }

  protected handleSemicolonFound(
    lexeme: string,
    def?: LexemeDef
  ): BlockActions {
    if (!isWhitespace(lexeme)) {
      this.refState = LinkrefState.url_open;
      this.linkref.url = lexeme;
    }

    return BlockActions.CONTINUE;
  }

  protected handleUrlOpen(lexeme: string, def?: LexemeDef): BlockActions {
    if (this.linkref.url != "" && isWhitespace(lexeme)) {
      this.refState = LinkrefState.url_closed;
    } else {
      this.linkref.url += lexeme;
    }

    return BlockActions.CONTINUE;
  }

  protected handleUrlClosed(lexeme: string, def?: LexemeDef): BlockActions {
    if (lexeme == "(") {
      this.refState = LinkrefState.comment_open;
    } else {
      this.notInGoodShape();
    }

    return BlockActions.CONTINUE;
  }

  protected handleCommentOpen(lexeme: string, def?: LexemeDef): BlockActions {
    if (lexeme !== ")" || this.lastLexEsc) {
      this.linkref.comment += lexeme;
    } else if (lexeme === ")") {
      this.refState = LinkrefState.comment_closed;
    }

    return BlockActions.CONTINUE;
  }

  protected handleCommentClosed(lexeme: string, def?: LexemeDef): BlockActions {
    if (!isWhitespace(lexeme)) {
      this.notInGoodShape();
    }

    return BlockActions.CONTINUE;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new LinkrefParagraphHandler();
  }

  toString() {
    if (!this.inGoodShape) {
      return super.toString();
    }

    return "";
  }
}
