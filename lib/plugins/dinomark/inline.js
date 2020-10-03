"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DinoInlineHandler = exports.Var = void 0;
const link_1 = require("../markdown/inline/link");
const lexemes_1 = require("./lexemes");
const types_1 = require("../../types");
const directives_var_1 = require("./directives.var");
const getStaticFormatter = () => {
    const buffer = [];
    return {
        buffer,
        push: (lexeme) => {
            buffer.push(lexeme);
        },
        toJSON() {
            return { type: "static", buffer: [...this.buffer] };
        },
    };
};
class Var extends link_1.Link {
    constructor(params) {
        super({
            url: params.url ?? getStaticFormatter(),
            text: getStaticFormatter(),
        });
    }
    setToReference() {
        super.setToReference();
        this.url = new directives_var_1.VarReferenceGetter();
        return this;
    }
    toJSON() { }
}
exports.Var = Var;
/**
 * Handles the following dynamic inline markup:
 *
 * ```
 * [][var.name]           # use '.' for sub-keys
 * [](general expression) # not yet supported
 * ```
 */
class DinoInlineHandler extends link_1.BaseLinkHandler {
    constructor() {
        super(lexemes_1.DINO_LEX_INLINE);
    }
    getName() {
        return "dinomark:inline-linkref";
    }
    getNewLinkInstance() {
        return new Var({});
    }
    handleStart(lexeme, def) {
        if (lexeme == this.opener) {
            this.state = link_1.LinkHandlerState.text_closed;
            this.link = this.getNewLinkInstance();
            return types_1.InlineActions.CONTINUE;
        }
        return types_1.InlineActions.REJECT;
    }
    toString() {
        return this.link.url.resolveValue(this._context);
    }
    cloneInstance() {
        return new DinoInlineHandler();
    }
}
exports.DinoInlineHandler = DinoInlineHandler;
