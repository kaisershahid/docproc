import { BlockHandlerType, HandlerInterface } from "../../types";
import { Linkref, LinkrefParagraphHandler } from "../markdown/linkref-paragraph";
import { DirectiveDefinition } from "./directives";
export declare class DinoBlockHandler extends LinkrefParagraphHandler {
    lexStart: string;
    directives: DirectiveDefinition[];
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    getName(): string;
    lastLink?: Linkref;
    handlerEnd(): void;
    toString(): string;
}
