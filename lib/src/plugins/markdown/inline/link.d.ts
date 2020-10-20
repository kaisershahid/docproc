import { BaseHandler } from "../../../inline/handlers/base";
import { DocProcContext, HandlerInterface, InlineActions, InlineFormatterInterface, InlineHandlerType, LexemeDef } from "../../../types";
export declare enum LinkHandlerState {
    start = 0,
    text_open = 1,
    text_closed = 2,
    url_open = 3,
    url_closed = 4
}
export declare enum LinkType {
    anchor = 0,
    img = 1
}
export declare enum LinkMode {
    url = 0,
    ref = 1
}
export declare class Link {
    ctx?: DocProcContext;
    text: InlineFormatterInterface;
    url: InlineFormatterInterface;
    type: LinkType;
    mode: LinkMode;
    constructor(params: {
        text: InlineFormatterInterface;
        url: InlineFormatterInterface;
        context?: DocProcContext;
    });
    setToImage(): this;
    setToReference(): this;
    toString(): string;
    resolveUrl(): string;
    toImage(): string;
    toAnchor(): string;
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
export declare class BaseLinkHandler extends BaseHandler {
    opener: string;
    constructor(opener: string);
    canAccept(lexeme: string): boolean;
    nextAction(lexeme: string): InlineActions;
    state: LinkHandlerState;
    lastLex: string;
    lastLexEsc: boolean;
    link: Link | any;
    undoBuffer: any[];
    isInvalid: boolean;
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
    push(lexeme: string, def?: LexemeDef | undefined): any;
    getNewLinkInstance(): Link;
    protected handleStart(lexeme: string, def?: LexemeDef): InlineActions;
    protected handleTextOpen(lexeme: string, def?: LexemeDef): InlineActions;
    protected handleTextClosed(lexeme: string, def?: LexemeDef): InlineActions;
    protected handleUrlOpen(lexeme: string, def?: LexemeDef): InlineActions;
    protected handleUrlClosed(lexeme: string, def?: LexemeDef): InlineActions;
    toString(): any;
}
export declare class LinkHandler extends BaseLinkHandler {
    constructor();
    getName(): string;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
}
export declare class ImageHandler extends BaseLinkHandler {
    constructor();
    getName(): string;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
}
