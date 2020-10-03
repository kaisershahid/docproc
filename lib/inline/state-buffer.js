"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineStateBuffer = exports.actionIsDeferred = exports.actionShouldUseNewHandler = void 0;
const types_1 = require("../types");
const default_parent_1 = require("./handlers/default-parent");
exports.actionShouldUseNewHandler = (action) => action == types_1.InlineActions.DEFER || action == types_1.InlineActions.REJECT;
exports.actionIsDeferred = (action) => action == types_1.InlineActions.DEFER;
/**
 * Collects lexemes into a properly nested structure of handlers and words.
 */
class InlineStateBuffer {
    constructor(context) {
        this.stack = [];
        this.handlersByLex = {};
        this.context = context;
        this.manager = context.inlineManager;
        this.defaultHandler = new default_parent_1.DefaultParentHandler();
        this.defaultHandler.setContext(context);
        this.stack.push(this.defaultHandler);
    }
    push(lex, def) {
        let cur = this.stack[0];
        if (cur === this.defaultHandler) {
            // at the root level
            if (!this.wasNewHandlerFoundAndPushedForLex(lex, def)) {
                cur.push(lex);
            }
        }
        else {
            // 1+ levels deep
            let action = cur.nextAction(lex);
            if (exports.actionShouldUseNewHandler(action)) {
                if (!exports.actionIsDeferred(action)) {
                    this.stack.shift();
                    cur = this.stack[0];
                }
                if (this.wasNewHandlerFoundAndPushedForLex(lex, def)) {
                    return;
                }
            }
            action = cur.push(lex, def);
            switch (action) {
                case types_1.InlineActions.POP:
                    this.stack.shift();
                    break;
                case types_1.InlineActions.REJECT:
                    this.stack.shift();
                    this.push(lex, def);
                    break;
            }
        }
    }
    /**
     * Attempt to find a new handler for the lexeme. If found, push to stack and return true.
     * Otherwise, return false.
     * @param lex
     * @param def
     * @protected
     */
    wasNewHandlerFoundAndPushedForLex(lex, def) {
        let newHandler = this.findHandler(lex);
        if (newHandler) {
            newHandler = newHandler.cloneInstance();
            newHandler.setContext(this.context);
            newHandler.push(lex);
            // @todo only push to stack if push() returns NEST
            this.stack[0].addChild(newHandler);
            this.stack.unshift(newHandler);
            return true;
        }
        return false;
    }
    findHandler(lex) {
        if (this.handlersByLex[lex] !== undefined) {
            return this.handlersByLex[lex];
        }
        let rankedHandlers = [];
        this.manager.withHandlers((handlers) => {
            rankedHandlers = (handlers.filter((h) => h.canAccept(lex)));
        });
        return (this.handlersByLex[lex] = rankedHandlers[0] ?? null);
    }
    toString() {
        return this.defaultHandler.toString();
    }
}
exports.InlineStateBuffer = InlineStateBuffer;
