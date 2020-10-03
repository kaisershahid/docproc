"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectiveExecute = exports.DirectiveProcess = exports.DirectiveInclude = void 0;
const fs_1 = __importDefault(require("fs"));
const doc_processor_1 = require("../../doc-processor");
class DirectiveInclude {
    invokeDirective(def, ctx) {
        // @todo support multi-root lookup?
        const rootDir = ctx.vars.sys?.sourceRoot ?? process.cwd();
        const filePath = `${rootDir}/${def.action}`;
        if (!fs_1.default.existsSync(filePath)) {
            return;
        }
        return this.processFile(def, ctx, filePath);
    }
    processFile(def, ctx, filePath) {
        return fs_1.default.readFileSync(filePath).toString();
    }
}
exports.DirectiveInclude = DirectiveInclude;
DirectiveInclude.DIRECTIVE = "include";
class DirectiveProcess extends DirectiveInclude {
    processFile(def, ctx, filePath) {
        const content = fs_1.default.readFileSync(filePath).toString();
        const docproc = new doc_processor_1.DocProcessor(ctx);
        docproc.process(content);
        return docproc.toString();
    }
}
exports.DirectiveProcess = DirectiveProcess;
DirectiveProcess.DIRECTIVE = "process";
class DirectiveExecute extends DirectiveInclude {
    processFile(def, ctx, filePath) {
        try {
            const retVal = require(filePath).execute(ctx, def);
            if (retVal !== undefined && retVal !== null) {
                return retVal;
            }
        }
        catch (e) {
            // @todo log exception somewhere
        }
        return "";
    }
}
exports.DirectiveExecute = DirectiveExecute;
DirectiveExecute.DIRECTIVE = "execute";
