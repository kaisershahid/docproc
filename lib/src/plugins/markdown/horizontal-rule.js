"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalRuleHandler = void 0;
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const block_base_1 = require("../../defaults/block-base");
const lexdef_lookaheads_1 = require("./lexdef.lookaheads");
/**
 * Handle horizontal rules.
 */
class HorizontalRuleHandler extends block_base_1.BlockBase {
    constructor() {
        super(...arguments);
        this.rule = [];
        this.lastLex = "";
    }
    getName() {
        return "horizontal-rule";
    }
    canAccept(lexeme, def) {
        return lexdef_lookaheads_1.REGEX_HORIZONTAL_RULE.test(lexeme);
    }
    push(lexeme, def) {
        if (lexdef_lookaheads_1.REGEX_HORIZONTAL_RULE.test(lexeme)) {
            this.pushLine();
        }
        else if (utils_1.isLineEnd(this.lastLex)) {
            // line start, but not hrule start
            return types_1.BlockActions.REJECT;
        }
        else if (utils_1.isLineEnd(lexeme) && utils_1.isLineEnd(this.lastLex)) {
            return types_1.BlockActions.DONE;
        }
        this.lastLex = lexeme;
        return types_1.BlockActions.CONTINUE;
    }
    pushLine() {
        if (this.lastLex === "" || utils_1.isLineEnd(this.lastLex)) {
            this.rule.push("<hr />");
        }
    }
    cloneInstance() {
        return new HorizontalRuleHandler();
    }
    toString() {
        return this.rule.join("\n");
    }
}
exports.HorizontalRuleHandler = HorizontalRuleHandler;
