"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectivesManager = exports.DINOMARK_SERVICE_DIRECTIVE = void 0;
exports.DINOMARK_SERVICE_DIRECTIVE = "directive-manager";
/**
 * Maps a directive/action to a handler.
 */
class DirectivesManager {
    constructor() {
        this.handlers = {};
    }
    addHandler(handler, def) {
        var _a;
        const key = `${def.directive}.${(_a = def.action) !== null && _a !== void 0 ? _a : ""}`;
        this.handlers[key] = handler;
        return this;
    }
    getHandler(def) {
        var _a, _b;
        const key1 = `${def.directive}.${(_a = def.action) !== null && _a !== void 0 ? _a : ""}`;
        const key2 = def.directive + ".";
        return (_b = this.handlers[key1]) !== null && _b !== void 0 ? _b : this.handlers[key2];
    }
    /**
     * Finds either the directive/action or directive handler for the given definition.
     * @param def
     * @param ctx
     */
    invokeDirective(def, ctx) {
        var _a;
        return (_a = this.getHandler(def)) === null || _a === void 0 ? void 0 : _a.invokeDirective(def, ctx);
    }
}
exports.DirectivesManager = DirectivesManager;
