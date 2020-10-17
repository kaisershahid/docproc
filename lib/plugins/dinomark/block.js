"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DinoBlockHandler = void 0;
const types_1 = require("../../types");
const lexemes_1 = require("./lexemes");
const linkref_paragraph_1 = require("../markdown/linkref-paragraph");
const directives_1 = require("./directives");
class DinoBlockHandler extends linkref_paragraph_1.LinkrefParagraphHandler {
    constructor() {
        super(...arguments);
        this.lexStart = lexemes_1.DINO_LEX_BLOCK;
        this.directives = [];
        this.pushedNewLink = false;
    }
    cloneInstance() {
        return new DinoBlockHandler();
    }
    getName() {
        return "dinomark:block-linkref";
    }
    getDirectivesManager() {
        return this.context
            ?.pluginServicesManager.getService("dinomark", directives_1.DINOMARK_SERVICE_DIRECTIVE);
    }
    getHandlerForLastDirective() {
        const def = this.directives[this.directives.length - 1];
        return this.getDirectivesManager()?.getHandler(def);
    }
    push(lexeme, def) {
        this.pushedNewLink = false;
        let action = super.push(lexeme, def);
        // check if the directive's handler wants to modify blocks
        if (this.pushedNewLink) {
            if (this.getHandlerForLastDirective()?.modifyBlocks) {
                return types_1.BlockActions.REORDER;
            }
        }
        return action;
    }
    handlerEnd() {
        // @todo state checks
        if (this.lastLink === this.linkref) {
            return;
        }
        this.pushedNewLink = true;
        this.directives.push({
            directive: this.linkref.key,
            action: this.linkref.url,
            parameters: this.linkref.comment,
        });
        this.lastLink = this.linkref;
    }
    modifyBlocks(blocks) {
        return (this.getHandlerForLastDirective()
            .modifyBlocks(blocks, this.directives[this.directives.length - 1], this.context) ?? blocks);
    }
    toString() {
        this.handlerEnd();
        const dm = this.getDirectivesManager();
        if (!dm) {
            return "";
        }
        const buff = [];
        this.directives.forEach((d) => {
            const val = dm.invokeDirective(d, this.context);
            if (val !== null && val !== undefined) {
                buff.push(val);
            }
        });
        return buff.join("");
    }
}
exports.DinoBlockHandler = DinoBlockHandler;
