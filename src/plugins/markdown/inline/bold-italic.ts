import { SimpleWrapHandler } from "../../../inline/handlers/simple-wrap";

export class BoldHandler extends SimpleWrapHandler {
  constructor() {
    super("__", "<b>", "</b>");
  }
}

export class ItalicHandler extends SimpleWrapHandler {
  constructor() {
    super("_", "<i>", "</i>");
  }
}

export class StrongHandler extends SimpleWrapHandler {
  constructor() {
    super("**", "<strong>", "</strong>");
  }
}

export class EmphasisHandler extends SimpleWrapHandler {
  constructor() {
    super("*", "<emphasis>", "</emphasis>");
  }
}
