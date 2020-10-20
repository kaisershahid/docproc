"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmphasisHandler = exports.StrongHandler = exports.ItalicHandler = exports.BoldHandler = void 0;
const simple_wrap_1 = require("../../../inline/handlers/simple-wrap");
class BoldHandler extends simple_wrap_1.SimpleWrapHandler {
    constructor() {
        super("__", "<b>", "</b>");
    }
    cloneInstance() {
        return new BoldHandler();
    }
}
exports.BoldHandler = BoldHandler;
class ItalicHandler extends simple_wrap_1.SimpleWrapHandler {
    constructor() {
        super("_", "<i>", "</i>");
    }
    cloneInstance() {
        return new ItalicHandler();
    }
}
exports.ItalicHandler = ItalicHandler;
class StrongHandler extends simple_wrap_1.SimpleWrapHandler {
    constructor() {
        super("**", "<strong>", "</strong>");
    }
    cloneInstance() {
        return new StrongHandler();
    }
}
exports.StrongHandler = StrongHandler;
class EmphasisHandler extends simple_wrap_1.SimpleWrapHandler {
    constructor() {
        super("*", "<em>", "</em>");
    }
    cloneInstance() {
        return new EmphasisHandler();
    }
}
exports.EmphasisHandler = EmphasisHandler;
