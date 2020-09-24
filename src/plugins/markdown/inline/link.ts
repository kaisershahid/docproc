import { BaseHandler } from "../../../inline/handlers/base";
import {
  DocContext,
  InlineActions,
  InlineFormatterInterface,
  LexemeDef,
} from "../../../types";
import { escapeHtml } from "../../../utils_/escape-html";

export enum LinkHandlerState {
  start,
  text_open,
  text_closed,
  link_open,
  link_close,
}

export enum LinkType {
  anchor,
  img,
}

export enum LinkMode {
  url,
  ref,
}

export class Link {
  ctx: DocContext;
  text: InlineFormatterInterface;
  url: InlineFormatterInterface;
  type = LinkType.anchor;
  mode = LinkMode.url;

  constructor(ctx: DocContext) {
    this.ctx = ctx;
    this.text = ctx.getInlineFormatter();
    this.url = ctx.getInlineFormatter();
  }

  setToImage() {
    this.type = LinkType.img;
    return this;
  }

  setToReference() {
    this.mode = LinkMode.ref;
    return this;
  }

  toString() {
    return this.type == LinkType.img ? this.toImage() : this.toAnchor();
  }

  toImage() {
    const buff = ['<img src="'];
    // @todo resolve ref
    buff.push(escapeHtml(this.url.toString()));
    buff.push('" alt="');
    buff.push(escapeHtml(this.text.toString()));
    buff.push('" />');
    return buff.join("");
  }

  toAnchor() {
    const buff = ['<a href="'];
    // @todo resolve ref
    const text = this.text.toString();
    buff.push(this.url.toString());
    buff.push('" alt="');
    buff.push(escapeHtml(text));
    buff.push('">');
    buff.push(text);
    buff.push("</a>");
    return buff.join("");
  }
}

export class BaseLinkHandler extends BaseHandler {
  opener: string;

  constructor(opener: string) {
    super();
    this.opener = opener;
  }

  canAccept(lexeme: string): boolean {
    return lexeme == this.opener;
  }

  nextAction(lexeme: string): InlineActions {
    if (this.state == LinkHandlerState.text_open) {
      if (lexeme !== "]") {
        return InlineActions.DEFER;
      } else {
        return InlineActions.CONTINUE;
      }
    } else if (
      this.state == LinkHandlerState.text_closed &&
      (lexeme == "[" || lexeme == "(")
    ) {
      return InlineActions.CONTINUE;
    } else if (this.state == LinkHandlerState.link_open) {
      return InlineActions.CONTINUE;
    }

    return InlineActions.REJECT;
  }

  state = LinkHandlerState.start;
  lastLex = "";
  lastLexEsc = false;
  link: Link | any = {};

  push(lexeme: string, def?: LexemeDef | undefined): any {
    let ret = InlineActions.REJECT;
    switch (this.state) {
      case LinkHandlerState.start:
        if (lexeme == this.opener) {
          this.state = LinkHandlerState.text_open;
          this.link = new Link(this._context as DocContext);
          if (this.opener == "![") {
            this.link.setToImage();
          }
        }
        break;
      case LinkHandlerState.text_open:
        if (lexeme == "]" && !this.lastLexEsc) {
          this.state = LinkHandlerState.text_closed;
        } else if (lexeme != "\\") {
          this.link.text.push(lexeme, def);
        }

        ret = InlineActions.CONTINUE;
        break;
      case LinkHandlerState.text_closed:
        if (lexeme == "[") {
          this.state = LinkHandlerState.link_open;
          this.link.setToReference();
          ret = InlineActions.CONTINUE;
        } else if (lexeme == "(") {
          this.state = LinkHandlerState.link_open;
          ret = InlineActions.CONTINUE;
        } else {
          ret = InlineActions.REJECT;
        }
        break;
      case LinkHandlerState.link_open:
        if (!this.lastLexEsc) {
          if (this.link.mode == LinkMode.url && lexeme == ")") {
            ret = InlineActions.POP;
          } else if (this.link.mode == LinkMode.ref && lexeme == "]") {
            ret = InlineActions.POP;
          } else if (lexeme != "\\") {
            this.link.url.push(lexeme, def);
            ret = InlineActions.CONTINUE;
          }
        } else {
          this.link.url.push(lexeme, def);
          ret = InlineActions.CONTINUE;
        }
        break;
      case LinkHandlerState.link_close:
        break;
    }

    this.lastLex = lexeme;
    this.lastLexEsc = lexeme == "\\";
    return ret;
  }

  toString() {
    return this.link.toString();
  }
}

export class LinkHandler extends BaseLinkHandler {
  constructor() {
    super("[");
  }

  getName(): string {
    return "anchor";
  }
}

export class ImageHandler extends BaseLinkHandler {
  constructor() {
    super("![");
  }

  getName(): string {
    return "image";
  }
}
