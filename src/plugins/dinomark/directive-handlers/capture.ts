import { DirectiveHandler, DirectiveDefinition } from "../directives";
import {
  BlockHandlerType,
  DocProcContext,
  HandlerInterface,
} from "../../../types";
import { BlocksListWrapper } from "../../../defaults/block-wrappers";
import { DinoBlockHandler } from "../block";
import { VarReferenceAccessor } from "../directives.var";

export class DirectiveCaptureStart implements DirectiveHandler {
  static readonly DIRECTIVE = "capture";
  invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any {}
}

/**
 * Removes blocks until block containing `capture` directive is found. If not found, no changes are made
 */
export class DirectiveCaptureEnd implements DirectiveHandler {
  static readonly DIRECTIVE = "end-capture";
  invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any {}

  modifyBlocks(
    blocks: HandlerInterface<BlockHandlerType>[],
    def: DirectiveDefinition,
    context: DocProcContext
  ): HandlerInterface<BlockHandlerType>[] {
    const capturedBlocks: HandlerInterface<BlockHandlerType>[] = [];
    const myBlock = blocks.pop() as HandlerInterface<BlockHandlerType>;

    while (blocks.length > 0) {
      const curBlock = blocks.pop() as HandlerInterface<BlockHandlerType>;
      const isCapture = DirectiveCaptureEnd.isBlockCaptureStart(curBlock);
      if (isCapture !== false) {
        DirectiveCaptureEnd.storeCapturedInVar(
          capturedBlocks,
          isCapture,
          context
        );
        return [...blocks, myBlock];
      }

      capturedBlocks.unshift(curBlock);
    }

    return [...capturedBlocks, myBlock];
  }

  private static isBlockCaptureStart(
    curBlock: HandlerInterface<BlockHandlerType>
  ): false | { varName: string } {
    if (curBlock instanceof DinoBlockHandler) {
      for (let i = 0; i < curBlock.directives.length; i++) {
        const dirDef = curBlock.directives[i];
        if (dirDef.directive == DirectiveCaptureStart.DIRECTIVE) {
          return { varName: dirDef.action };
        }
      }
    }

    return false;
  }

  private static storeCapturedInVar(
    capturedBlocks: HandlerInterface<BlockHandlerType>[],
    captureParams: { varName: string },
    context: DocProcContext
  ) {
    VarReferenceAccessor.setVarInContext(
      captureParams.varName,
      new BlocksListWrapper(capturedBlocks),
      context
    );
  }
}
