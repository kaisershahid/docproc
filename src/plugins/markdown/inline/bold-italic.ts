import { SimpleWrapHandler } from "../../../inline/handlers/simple-wrap";
import { HandlerInterface, InlineHandlerType } from "../../../types";

export class BoldHandler extends SimpleWrapHandler {
  constructor() {
    super("__", "<b>", "</b>");
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new BoldHandler();
  }
}

export class ItalicHandler extends SimpleWrapHandler {
  constructor() {
    super("_", "<i>", "</i>");
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new ItalicHandler();
  }
}

export class StrongHandler extends SimpleWrapHandler {
  constructor() {
    super("**", "<strong>", "</strong>");
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new StrongHandler();
  }
}

export class EmphasisHandler extends SimpleWrapHandler {
  constructor() {
    super("*", "<emphasis>", "</emphasis>");
  }

  cloneInstance(): HandlerInterface<InlineHandlerType> {
    return new EmphasisHandler();
  }
}
