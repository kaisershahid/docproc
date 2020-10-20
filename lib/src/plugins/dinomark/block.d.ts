import { BlockActions, BlockHandlerType, HandlerInterface, LexemeDef } from "../../types";
import { Linkref, LinkrefParagraphHandler } from "../markdown/linkref-paragraph";
import { DirectiveDefinition, DirectiveHandler, DirectivesManager } from "./directives";
export declare class DinoBlockHandler extends LinkrefParagraphHandler {
    lexStart: string;
    directives: DirectiveDefinition[];
    cloneInstance(): HandlerInterface<BlockHandlerType>;
    getName(): string;
    getDirectivesManager(): DirectivesManager | undefined;
    getHandlerForLastDirective(): DirectiveHandler | undefined;
    pushedNewLink: boolean;
    lastLink?: Linkref;
    push(lexeme: string, def?: LexemeDef): BlockActions;
    handlerEnd(): void;
    modifyBlocks(blocks: HandlerInterface<BlockHandlerType>[]): HandlerInterface<BlockHandlerType>[];
    toString(): string;
}
