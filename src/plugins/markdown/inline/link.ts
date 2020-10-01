import { BaseHandler } from "../../../inline/handlers/base";
import {
  DocProcContext,
  HandlerInterface,
  InlineActions,
  InlineFormatterInterface,
  InlineHandlerType,
  LexemeConsumer,
  LexemeDef,
} from "../../../types";
import { escapeHtml } from "../../../utils_/escape-html";
import { getLinkrefByKey } from "../linkref-paragraph";

export enum LinkHandlerState {
  start,
  text_open,
  text_closed,
  url_open,
  url_closed,
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
  ctx?: DocProcContext;
  text: InlineFormatterInterface;
  url: InlineFormatterInterface;
  type = LinkType.anchor;
  mode = LinkMode.url;

  constructor(params: {
    text: InlineFormatterInterface;
    url: InlineFormatterInterface;
    context?: DocProcContext;
  }) {
    const { text, url, context } = params;
    this.ctx = context;
    this.text = text;
    this.url = url;
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

  resolveUrl(): string {
    const url = this.url.toString();
    if (this.mode == LinkMode.ref) {
      const ref = getLinkrefByKey(url);
      return ref?.url ?? url;
    }

    return url;
  }

  toImage() {
    const buff = ['<img src="'];
    buff.push(escapeHtml(this.resolveUrl()));
    buff.push('" alt="');
    buff.push(escapeHtml(this.text.toString()));
    buff.push('" />');
    return buff.join("");
  }

  toAnchor() {
    const buff = ['<a href="'];
    const text = this.text.toString();
    buff.push(this.resolveUrl());
    buff.push('" alt="');
    buff.push(escapeHtml(text));
    buff.push('">');
    buff.push(text);
    buff.push("</a>");
    return buff.join("");
  }
}

/**
 * Handles image and anchor elements:
 *
 * ```
 * [Link Text](http://urll)
 * [Link Text][ref]   -> [ref]: http://url
 * ![Image Alt](http://src)
 * ![Image Alt][ref]  -> [ref]: http://src
 * ```
 */
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
    } else if (this.state == LinkHandlerState.url_open) {
      return InlineActions.CONTINUE;
    }

    return InlineActions.REJECT;
  }

  state = LinkHandlerState.start;
  lastLex = "";
  lastLexEsc = false;
  link: Link | any = {};

  /**
   * State transitions overview:
   *
   * ```
   * start: '!?\[' -> text_open       # start building alt/display text
   * text_open: '[^\]]+' -> text_open # also accepts '\\]'; build alt/display text
   * text_open: '\]' -> text_closed   #
   * text_closed: '[(\[]' -> url_open # start building url/ref
   * url_open: '[^\])]+' -> url_open  # build url/ref
   * url_open: '[\])]' -> url_closed  # done with link
   * ```
   *
   * > Note: whichever token opens the url/ref will allow the alternate token
   * > (e.g. `(url)` will accept `[]`)
   *
   * @param lexeme
   * @param def
   */
  push(lexeme: string, def?: LexemeDef | undefined): any {
    let ret = InlineActions.REJECT;
    switch (this.state) {
      case LinkHandlerState.start:
        ret = this.handleStart(lexeme, def);
        break;
      case LinkHandlerState.text_open:
        ret = this.handleTextOpen(lexeme, def);
        break;
      case LinkHandlerState.text_closed:
        ret = this.handleTextClosed(lexeme, def);
        break;
      case LinkHandlerState.url_open:
        ret = this.handleUrlOpen(lexeme, def);
        break;
      case LinkHandlerState.url_closed:
        ret = this.handleUrlClosed(lexeme, def);
        break;
    }

    this.lastLex = lexeme;
    this.lastLexEsc = lexeme == "\\";
    return ret;
  }

  getNewLinkInstance(): Link {
    const context = this._context;
    return new Link({
      context,
      text: context?.getInlineFormatter() as InlineFormatterInterface,
      url: context?.getInlineFormatter() as InlineFormatterInterface,
    });
  }

  protected handleStart(lexeme: string, def?: LexemeDef): InlineActions {
    if (lexeme == this.opener) {
      this.state = LinkHandlerState.text_open;
      this.link = this.getNewLinkInstance();
      if (this.opener == "![") {
        this.link.setToImage();
      }

      return InlineActions.CONTINUE;
    }

    return InlineActions.REJECT;
  }

  protected handleTextOpen(lexeme: string, def?: LexemeDef): InlineActions {
    if (lexeme == "]" && !this.lastLexEsc) {
      this.state = LinkHandlerState.text_closed;
    } else if (lexeme != "\\") {
      this.link.text.push(lexeme, def);
    }

    return InlineActions.CONTINUE;
  }

  protected handleTextClosed(lexeme: string, def?: LexemeDef): InlineActions {
    if (lexeme == "[") {
      this.state = LinkHandlerState.url_open;
      this.link.setToReference();
      return InlineActions.CONTINUE;
    } else if (lexeme == "(") {
      this.state = LinkHandlerState.url_open;
      return InlineActions.CONTINUE;
    } else {
      return InlineActions.REJECT;
    }
  }

  protected handleUrlOpen(lexeme: string, def?: LexemeDef): InlineActions {
    if (!this.lastLexEsc) {
      if (this.link.mode == LinkMode.url && lexeme == ")") {
        return InlineActions.POP;
      } else if (this.link.mode == LinkMode.ref && lexeme == "]") {
        return InlineActions.POP;
      } else if (lexeme != "\\") {
        this.link.url.push(lexeme, def);
        return InlineActions.CONTINUE;
      }
    } else {
      this.link.url.push(lexeme, def);
      return InlineActions.CONTINUE;
    }

    return InlineActions.REJECT;
  }

  protected handleUrlClosed(lexeme: string, def?: LexemeDef): InlineActions {
    return InlineActions.REJECT;
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

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new LinkHandler();
  }
}

export class ImageHandler extends BaseLinkHandler {
  constructor() {
    super("![");
  }

  getName(): string {
    return "image";
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new ImageHandler();
  }
}
