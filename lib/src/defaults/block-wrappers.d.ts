/**
 * This set of classes wrap blocks in various ways for deferred processing.
 * They should only be used **after** the block has finished processing.
 */
import { BlockEmptyHandler } from "./block-base";
/**
 * Coerces block elements to string and joins them with newline.
 */
export declare class BlocksListWrapper extends BlockEmptyHandler {
    blocks: any[];
    constructor(blocks: any);
    toString(): string;
}
/**
 *
 */
export declare class BlockDecorationWrapper extends BlockEmptyHandler {
    header: any;
    footer: any;
    block: any;
    constructor(block: any, header: any, footer: any);
    toString(): string;
}
