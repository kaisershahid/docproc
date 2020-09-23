import {
  BlockActions,
  BlockHandlerType,
  DocContext,
  HandlerInterface,
  LexemeConsumer,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import { BlockBase } from "../../defaults/block-base";
import { ParagraphHandler } from "../../defaults/paragraph-handler";

/**
 * Creating an abstraction here for paragraph in case we want to c
 */
export class ParagraphHandler
  extends ParagraphHandler
  implements HandlerInterface<BlockHandlerType> {}
