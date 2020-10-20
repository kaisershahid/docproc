import { BlockHandlerType, HandlerInterface } from "../../types";
import { ParagraphHandler as BaseParagraphHandler } from "../../defaults/paragraph-handler";
/**
 * Creating an abstraction here for paragraph in case we want to c
 */
export declare class ParagraphHandler extends BaseParagraphHandler implements HandlerInterface<BlockHandlerType> {
}
