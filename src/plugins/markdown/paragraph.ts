import {
  BlockActions,
  BlockHandlerType,
  DocContext,
  HandlerInterface,
  LexemeConsumer,
  LexemeDef,
} from "../../types";
import { isLineEnd } from "../../utils";
import { BlockBase } from "./block-base";
import { DefaultBlock } from "../../defaults/block-handler";

/**
 * Creating an abstraction here for paragraph in case we want to c
 */
export class ParagraphHandler
  extends DefaultBlock
  implements HandlerInterface<BlockHandlerType> {}
