import { AnyMap, BlockHandlerType, HandlerInterface, LexemeDef, StateInterface } from "./types";
/**
 * @deprecated
 */
export declare class ParserContext implements StateInterface {
    vars: AnyMap;
    protected cur: HandlerInterface<BlockHandlerType> | undefined;
    push(lex: string, def: LexemeDef | undefined): any;
    getCurrentHandler(): HandlerInterface<BlockHandlerType> | undefined;
    setCurrentHandler(handler?: HandlerInterface<BlockHandlerType>): void;
}
