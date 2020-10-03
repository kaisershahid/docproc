"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DinoBlockHandler = void 0;
const lexemes_1 = require("./lexemes");
const linkref_paragraph_1 = require("../markdown/linkref-paragraph");
const directives_1 = require("./directives");
class DinoBlockHandler extends linkref_paragraph_1.LinkrefParagraphHandler {
    constructor() {
        super(...arguments);
        this.lexStart = lexemes_1.DINO_LEX_BLOCK;
        this.directives = [];
    }
    cloneInstance() {
        return new DinoBlockHandler();
    }
    getName() {
        return "dinomark:block-linkref";
    }
    handlerEnd() {
        // @todo state checks
        if (this.lastLink === this.linkref) {
            return;
        }
        this.directives.push({
            directive: this.linkref.key,
            action: this.linkref.url,
            parameters: this.linkref.comment,
        });
        this.lastLink = this.linkref;
    }
    toString() {
        this.handlerEnd();
        const dm = this.context
            ?.pluginServicesManager.getService("dinomark", directives_1.DINOMARK_SERVICE_DIRECTIVE);
        if (!dm) {
            return "";
        }
        const buff = [];
        this.directives.forEach((d) => {
            buff.push(dm.invokeDirective(d, this.context));
        });
        return buff.join("");
    }
}
exports.DinoBlockHandler = DinoBlockHandler;
