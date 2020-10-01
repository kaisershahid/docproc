import {
  ContextAwareInterface,
  DocProcContext,
  InlineFormatterDummy,
  InlineFormatterInterface,
} from "../types";

export class BlockBase implements ContextAwareInterface {
  protected context?: DocProcContext;
  protected inlineFormatter: InlineFormatterInterface = InlineFormatterDummy;

  setContext(context: DocProcContext) {
    this.context = context;
    this.inlineFormatter = context.getInlineFormatter();
  }
}
