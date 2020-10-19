"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockDecorationWrapper = exports.BlocksListWrapper = void 0;
/**
 * This set of classes wrap blocks in various ways for deferred processing.
 * They should only be used **after** the block has finished processing.
 */
const block_base_1 = require("./block-base");
/**
 * Coerces block elements to string and joins them with newline.
 */
class BlocksListWrapper extends block_base_1.BlockEmptyHandler {
    constructor(blocks) {
        super();
        this.blocks = [];
        this.blocks = blocks;
    }
    toString() {
        return this.blocks.join("\n");
    }
}
exports.BlocksListWrapper = BlocksListWrapper;
/**
 *
 */
class BlockDecorationWrapper extends block_base_1.BlockEmptyHandler {
    constructor(block, header, footer) {
        super();
        this.header = "";
        this.footer = "";
        this.block = "";
        this.block = block;
        this.header = header;
        this.footer = footer;
    }
    toString() {
        return `${this.header}${this.block}${this.footer}`;
    }
}
exports.BlockDecorationWrapper = BlockDecorationWrapper;
