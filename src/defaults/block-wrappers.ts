/**
 * This set of classes wrap blocks in various ways for deferred processing.
 * They should only be used **after** the block has finished processing.
 */
import { BlockBase, BlockEmptyHandler } from "./block-base";

/**
 * Coerces block elements to string and joins them with newline.
 */
export class BlocksListWrapper extends BlockEmptyHandler {
  blocks: any[] = [];

  constructor(blocks: any) {
    super();
    this.blocks = blocks;
  }

  toString() {
    return this.blocks.join("\n");
  }
}

/**
 *
 */
export class BlockDecorationWrapper extends BlockEmptyHandler {
  header: any = "";
  footer: any = "";
  block: any = "";

  constructor(block: any, header: any, footer: any) {
    super();
    this.block = block;
    this.header = header;
    this.footer = footer;
  }

  toString() {
    return `${this.header}${this.block}${this.footer}`;
  }
}
