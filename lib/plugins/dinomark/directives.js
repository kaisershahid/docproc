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
        const key = `${def.directive}.${def.action ?? ""}`;
        this.handlers[key] = handler;
        return this;
    }
    getHandler(def) {
        const key1 = `${def.directive}.${def.action ?? ""}`;
        const key2 = def.directive + ".";
        return this.handlers[key1] ?? this.handlers[key2];
    }
    /**
     * Finds either the directive/action or directive handler for the given definition.
     * @param def
     * @param ctx
     */
    invokeDirective(def, ctx) {
        return this.getHandler(def)?.invokeDirective(def, ctx);
    }
}
exports.DirectivesManager = DirectivesManager;
