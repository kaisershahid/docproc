import { Lexer } from "./src/lexer";
import { HandlerManager, NAME_DEFAULT } from "./src/handler-manager";
import { DocProcessor } from "./src/doc-processor";
import { BlockBase } from "./src/defaults/block-base";
import {
  BlockActions,
  BlockHandlerType,
  HandlerInterface,
  InlineHandlerType,
} from "./src/types";
import { isLineEnd } from "./src/utils";
import { SimpleWrapHandler } from "./src/inline/handlers/simple-wrap";

/**
 * Boilerplate stuff -- you'll want to package up this initialization into something more convenient.
 */
const lexer = new Lexer();
const blockManager = new HandlerManager<BlockHandlerType>();
const inlineManager = new HandlerManager<BlockHandlerType>();
const docproc = new DocProcessor({ lexer, blockManager, inlineManager });

/**
 * Step 1: configure our lexer
 */
lexer.mergeLexemes({
  ">": { priority: 1 },
  " ": { priority: 1 },
  "**": { priority: 1 },
  _: { priority: 1 },
  "\n": { priority: 1 },
});

// that's it. don't worry about priority for now.

/**
 * Step 2: create our blockhandlers
 */

class BlockquoteHandler
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  getName() {
    return "blockquote";
  }

  canAccept(lexeme: string) {
    return lexeme == ">";
  }

  lastLex = "";
  prevLex = "";

  /**
   * Entrypoint for tokens. Return type tells parser what to do next,
   * @param lexeme
   */
  push(lexeme: string): BlockActions {
    this.prevLex = this.lastLex;
    this.lastLex = lexeme;
    // start of block or after a new line in block
    if (this.prevLex == "" || isLineEnd(this.prevLex)) {
      // we're expecting '>'. reject this and have another handler retry it
      if (lexeme != ">") {
        return BlockActions.REJECT;
      }

      // don't save '>' to output
      return BlockActions.CONTINUE;
    } else if (isLineEnd(lexeme)) {
      // 2 consecutive line endings
      if (isLineEnd(this.prevLex)) {
        return BlockActions.DONE;
      }
    }

    this.inlineFormatter.push(lexeme);
    return BlockActions.CONTINUE;
  }

  toString() {
    return `<blockquote>${this.inlineFormatter.toString()}</blockquote>`;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new BlockquoteHandler();
  }
}

class ParagraphHandler
  extends BlockBase
  implements HandlerInterface<BlockHandlerType> {
  getName() {
    // handler manager will use this as the fallback
    return NAME_DEFAULT;
  }

  canAccept(lexeme: string) {
    return true;
  }

  lastLex = "";
  prevLex = "";
  words: any[] = [];

  /**
   * Entrypoint for tokens. Return type tells parser what to do next,
   * @param lexeme
   */
  push(lexeme: string): BlockActions {
    this.prevLex = this.lastLex;
    this.lastLex = lexeme;

    if (isLineEnd(lexeme)) {
      // 2 consecutive line endings
      if (isLineEnd(this.prevLex)) {
        return BlockActions.DONE;
      }
    }

    this.inlineFormatter.push(lexeme);
    return BlockActions.CONTINUE;
  }

  toString() {
    return `<p>${this.inlineFormatter.toString()}</p>`;
  }

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new ParagraphHandler();
  }
}

// let's register an instance of each with the block manager
blockManager.addHandler(new ParagraphHandler());
blockManager.addHandler(new BlockquoteHandler());

/**
 * Step 3: create our inline handlers. I'm going to cheat and extend from
 * a base class designed specifically for this.
 */

class BoldInlineHandler extends SimpleWrapHandler {
  constructor() {
    super("**", "<b>", "</b>");
  }

  getName() {
    return "bold";
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new BoldInlineHandler();
  }
}

class ItalicInlineHandler extends SimpleWrapHandler {
  constructor() {
    super("_", "<i>", "</i>");
  }

  getName() {
    return "italic";
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new ItalicInlineHandler();
  }
}

// register with inlineManager
inlineManager.addHandler(new ItalicInlineHandler());
inlineManager.addHandler(new BoldInlineHandler());

// now let's see this in action!
const document = "> **blockquote**\n\nparagraph _**bold italic**_";
docproc.process(document);

console.log("# before\n");
console.log(document);
console.log("\n# after\n");
console.log(docproc.toString());
