"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHandler = void 0;
const types_1 = require("../../types");
class BaseHandler {
    constructor() {
        this._parent = null;
        this._children = [];
        this.words = [];
    }
    getChildren() {
        return this._children;
    }
    addChild(value) {
        this._children.push(value);
        this.words.push(value);
        return this;
    }
    getParent() {
        return null;
    }
    setParent(parent) {
        this._parent = parent;
        return this;
    }
    setContext(context) {
        this._context = context;
    }
    nextAction(lexeme) {
        return types_1.InlineActions.REJECT;
    }
    canAccept(lexeme) {
        throw new Error("canAccept() not implemented");
    }
    cloneInstance() {
        throw new Error("cloneInstance() not implemented");
    }
    getName() {
        throw new Error("getName() not implemented");
    }
    push(lexeme, def) {
        throw new Error("push() not implemented");
    }
    toString() {
        return this.words.join("");
    }
}
exports.BaseHandler = BaseHandler;
