import {
  ContextAwareInterface,
  DocContext,
  InlineFormatterDummy,
  InlineFormatterInterface,
} from "../../types";

export class BlockBase implements ContextAwareInterface {
  protected context?: DocContext;
  protected inlineFormatter: InlineFormatterInterface = InlineFormatterDummy;

  setContext(context: DocContext) {
    this.context = context;
    this.inlineFormatter = context.getInlineFormatter();
  }
}
