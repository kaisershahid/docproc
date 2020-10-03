"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultParentHandler = void 0;
const types_1 = require("../../types");
const base_1 = require("./base");
const utils_1 = require("../../utils");
/**
 * Used to collect tokens for plaintext output.
 */
class DefaultParentHandler extends base_1.BaseHandler {
    canAccept(lexeme) {
        return false;
    }
    getName() {
        return "default";
    }
    push(lexeme, def) {
        this.words.push(utils_1.returnUnescapedString(lexeme));
        return types_1.InlineActions.CONTINUE;
    }
}
exports.DefaultParentHandler = DefaultParentHandler;
