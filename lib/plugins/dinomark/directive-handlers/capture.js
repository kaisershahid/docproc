"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectiveCaptureEnd = exports.DirectiveCaptureStart = void 0;
const block_wrappers_1 = require("../../../defaults/block-wrappers");
const block_1 = require("../block");
const directives_var_1 = require("../directives.var");
class DirectiveCaptureStart {
    invokeDirective(def, ctx) { }
}
exports.DirectiveCaptureStart = DirectiveCaptureStart;
DirectiveCaptureStart.DIRECTIVE = "capture";
/**
 * Removes blocks until block containing `capture` directive is found. If not found, no changes are made
 */
class DirectiveCaptureEnd {
    invokeDirective(def, ctx) { }
    modifyBlocks(blocks, def, context) {
        const capturedBlocks = [];
        const myBlock = blocks.pop();
        while (blocks.length > 0) {
            const curBlock = blocks.pop();
            const isCapture = DirectiveCaptureEnd.isBlockCaptureStart(curBlock);
            if (isCapture !== false) {
                DirectiveCaptureEnd.storeCapturedInVar(capturedBlocks, isCapture, context);
                return [...blocks, myBlock];
            }
            capturedBlocks.unshift(curBlock);
        }
        return [...capturedBlocks, myBlock];
    }
    static isBlockCaptureStart(curBlock) {
        if (curBlock instanceof block_1.DinoBlockHandler) {
            for (let i = 0; i < curBlock.directives.length; i++) {
                const dirDef = curBlock.directives[i];
                if (dirDef.directive == DirectiveCaptureStart.DIRECTIVE) {
                    return { varName: dirDef.action };
                }
            }
        }
        return false;
    }
    static storeCapturedInVar(capturedBlocks, captureParams, context) {
        directives_var_1.VarReferenceAccessor.setVarInContext(captureParams.varName, new block_wrappers_1.BlocksListWrapper(capturedBlocks), context);
    }
}
exports.DirectiveCaptureEnd = DirectiveCaptureEnd;
DirectiveCaptureEnd.DIRECTIVE = "end-capture";
