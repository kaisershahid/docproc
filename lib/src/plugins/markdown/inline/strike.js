"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrikeHandler = exports.InlineHandlerState = void 0;
const simple_wrap_1 = require("../../../inline/handlers/simple-wrap");
const types_1 = require("../../../types");
var InlineHandlerState;
(function (InlineHandlerState) {
    InlineHandlerState[InlineHandlerState["start"] = 0] = "start";
    InlineHandlerState[InlineHandlerState["opening"] = 1] = "opening";
    InlineHandlerState[InlineHandlerState["opened"] = 2] = "opened";
    InlineHandlerState[InlineHandlerState["closing"] = 3] = "closing";
    InlineHandlerState[InlineHandlerState["closed"] = 4] = "closed";
})(InlineHandlerState = exports.InlineHandlerState || (exports.InlineHandlerState = {}));
const REGEX_TAG = /^~+$/;
class StrikeHandler extends simple_wrap_1.SimpleWrapHandler {
    constructor() {
        super("~", "<del>", "</del>");
        this.state = InlineHandlerState.start;
    }
    canAccept(lexeme) {
        return REGEX_TAG.test(lexeme);
    }
    isEnclosingLex(lexeme, def) {
        return /^~+$/.test(lexeme);
    }
    nextAction(lexeme) {
        // look here for any future issues around unbalanced tags
        if (this.state == InlineHandlerState.opening) {
            return types_1.InlineActions.CONTINUE;
        }
        else if (this.state == InlineHandlerState.opened) {
            if (this.lastLexEscaped || this.canAccept(lexeme)) {
                return types_1.InlineActions.CONTINUE;
            }
            return types_1.InlineActions.DEFER;
        }
        else if (this.state == InlineHandlerState.closing) {
            if (this.canAccept(lexeme)) {
                return types_1.InlineActions.CONTINUE;
            }
        }
        return types_1.InlineActions.REJECT;
    }
    handleEnclosingLex(lexeme, def) {
        if (this.state == InlineHandlerState.start) {
            this.state = InlineHandlerState.opening;
            this.inTag = true;
            return types_1.InlineActions.NEST;
        }
        else if (this.state == InlineHandlerState.opened) {
            this.state = InlineHandlerState.closing;
            return types_1.InlineActions.CONTINUE;
        }
        else if (this.state == InlineHandlerState.opening ||
            this.state == InlineHandlerState.closing) {
            if (this.lastLexEscaped) {
                this.words.push(lexeme);
                this.state = InlineHandlerState.opened;
            }
            return types_1.InlineActions.CONTINUE;
        }
        return types_1.InlineActions.REJECT;
    }
    handlePush(lexeme, def) {
        if (this.state == InlineHandlerState.closing) {
            this.state = InlineHandlerState.closed;
            this.inTag = false;
            this.closed = true;
            return types_1.InlineActions.REJECT;
        }
        if (this.state == InlineHandlerState.opening) {
            this.state = InlineHandlerState.opened;
        }
        this.words.push(lexeme);
        return types_1.InlineActions.CONTINUE;
    }
    cloneInstance() {
        return new StrikeHandler();
    }
}
exports.StrikeHandler = StrikeHandler;
