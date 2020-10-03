"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerManager = exports.NAME_DEFAULT = exports.insertAfter = exports.insertBefore = void 0;
exports.insertBefore = (handler, idx, handlers) => {
    if (idx == -1) {
        return [handler, ...handlers];
    }
    else {
        return [
            ...handlers.splice(0, idx),
            handler,
            ...handlers.splice(idx, handlers.length),
        ];
    }
};
exports.insertAfter = (handler, idx, handlers) => {
    if (idx == -1) {
        return [...handlers, handler];
    }
    else {
        return [
            ...handlers.splice(0, idx + 1),
            handler,
            ...handlers.splice(idx + 1, handlers.length),
        ];
    }
};
exports.NAME_DEFAULT = "DEFAULT";
class HandlerManager {
    constructor() {
        this.handlers = [];
    }
    setContext(context) {
        this.context = context;
        this.handlers.forEach((h) => h.setContext(context));
    }
    findHandlerIndex(name) {
        let idx = -1;
        this.handlers.forEach((handler, i) => {
            if (handler.getName() == name) {
                idx = i;
            }
        });
        return idx;
    }
    addHandler(handler, options) {
        if (handler.getName() == exports.NAME_DEFAULT) {
            this.defaultHandler = handler;
            return this;
        }
        const opts = options ?? {};
        if (opts.before) {
            this.handlers = exports.insertBefore(handler, this.findHandlerIndex(opts.before), this.handlers);
        }
        else if (opts.after) {
            this.handlers = exports.insertAfter(handler, this.findHandlerIndex(opts.after), this.handlers);
        }
        else if (opts.at) {
            const idx = this.findHandlerIndex(opts.at);
            if (idx == -1) {
                this.handlers.push(handler);
            }
            else {
                this.handlers[idx] = handler;
            }
        }
        else {
            this.handlers.push(handler);
        }
        return this;
    }
    withHandlers(callback) {
        const handlers = [...this.handlers];
        if (this.defaultHandler)
            handlers.push(this.defaultHandler);
        callback(handlers);
    }
    getNames() {
        return this.handlers.map((h) => h.getName());
    }
}
exports.HandlerManager = HandlerManager;
