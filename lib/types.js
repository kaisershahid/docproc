"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineFormatterDummy = exports.InlineActions = exports.BlockActions = exports.InlineHandlerType = exports.BlockHandlerType = exports.GenericHandlerType = exports.LEXEME_COMPLETE = void 0;
/**
 * The lexeme to emit once a document is complete. Since this isn't emitted in the normal
 * course of `lex()`, this value is reasonable.
 */
exports.LEXEME_COMPLETE = "";
/**
 * Empty classes that are used as generics for the handler interface.
 */
class GenericHandlerType {
}
exports.GenericHandlerType = GenericHandlerType;
class BlockHandlerType extends GenericHandlerType {
}
exports.BlockHandlerType = BlockHandlerType;
class InlineHandlerType extends GenericHandlerType {
}
exports.InlineHandlerType = InlineHandlerType;
/**
 * Control flow statuses for blocks.
 */
var BlockActions;
(function (BlockActions) {
    /**
     * Active block accepts the current lexeme but will defer the next lexeme to a better handler if found.
     */
    BlockActions["DEFER"] = "defer";
    /**
     * Active block accepts the current lexeme and will continue accepting.
     */
    BlockActions["CONTINUE"] = "continue";
    /**
     * Active block accepts the current lexeme but will no longer accept new ones.
     */
    BlockActions["DONE"] = "done";
    /**
     * Active block rejects the current lexeme (retry with another handler) and will no longer accept new ones.
     */
    BlockActions["REJECT"] = "reject";
})(BlockActions = exports.BlockActions || (exports.BlockActions = {}));
/**
 * Control flow statuses for inline handler.
 */
var InlineActions;
(function (InlineActions) {
    /**
     * If a specific handler is registered for a lexeme, use that instead of current one
     * if available (otherwise, continue using current handler).
     */
    InlineActions[InlineActions["DEFER"] = 0] = "DEFER";
    /**
     * Subsequent lexemes will be given to this handler until it finds a closing lexeme.
     */
    InlineActions[InlineActions["NEST"] = 1] = "NEST";
    /**
     * Continue accepting lexemes.
     */
    InlineActions[InlineActions["CONTINUE"] = 2] = "CONTINUE";
    /**
     * Closing lexeme encountered and consumed. Take current handler off stack.
     */
    InlineActions[InlineActions["POP"] = 3] = "POP";
    /**
     * Lexeme not accepted. Take current handler off stack and retry with parent.
     */
    InlineActions[InlineActions["REJECT"] = 4] = "REJECT";
})(InlineActions = exports.InlineActions || (exports.InlineActions = {}));
/**
 * Use this default to concretely initialize a formatter instance (that can be changed later). Avoids null checks.
 */
exports.InlineFormatterDummy = {
    push: (lex, def) => {
        throw new Error("inlineFormatter: did you forget to setContext()?");
    },
};
