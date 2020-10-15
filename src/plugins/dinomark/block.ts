import {
  BlockActions,
  BlockHandlerType,
  DocProcContext,
  HandlerInterface,
  LexemeDef,
  PluginServicesManagerInterface,
} from "../../types";
import { DINO_LEX_BLOCK } from "./lexemes";
import {
  Linkref,
  LinkrefParagraphHandler,
} from "../markdown/linkref-paragraph";
import {
  DINOMARK_SERVICE_DIRECTIVE,
  DirectiveDefinition,
  DirectiveHandler,
  DirectivesManager,
} from "./directives";

export class DinoBlockHandler extends LinkrefParagraphHandler {
  lexStart = DINO_LEX_BLOCK;
  directives: DirectiveDefinition[] = [];

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new DinoBlockHandler();
  }

  getName(): string {
    return "dinomark:block-linkref";
  }

  getDirectivesManager(): DirectivesManager | undefined {
    return (this.context
      ?.pluginServicesManager as PluginServicesManagerInterface).getService(
      "dinomark",
      DINOMARK_SERVICE_DIRECTIVE
    );
  }

  getHandlerForLastDirective(): DirectiveHandler | undefined {
    const def = this.directives[this.directives.length - 1];
    return this.getDirectivesManager()?.getHandler(def);
  }

  pushedNewLink = false;
  lastLink?: Linkref;

  push(lexeme: string, def?: LexemeDef): BlockActions {
    this.pushedNewLink = false;
    let action = super.push(lexeme, def);
    // check if the directive's handler wants to modify blocks
    if (this.pushedNewLink) {
      if (this.getHandlerForLastDirective()?.modifyBlocks) {
        return BlockActions.REORDER;
      }
    }

    return action;
  }

  handlerEnd() {
    // @todo state checks
    if (this.lastLink === this.linkref) {
      return;
    }

    this.pushedNewLink = true;
    this.directives.push({
      directive: this.linkref.key,
      action: this.linkref.url,
      parameters: this.linkref.comment,
    });
    this.lastLink = this.linkref;
  }

  modifyBlocks(
    blocks: HandlerInterface<BlockHandlerType>[]
  ): HandlerInterface<BlockHandlerType>[] {
    return (
      ((this.getHandlerForLastDirective() as DirectiveHandler)
        .modifyBlocks as Function)(
        blocks,
        this.directives[this.directives.length - 1],
        this.context as DocProcContext
      ) ?? blocks
    );
  }

  toString(): string {
    this.handlerEnd();
    const dm: DirectivesManager | undefined = this.getDirectivesManager();

    if (!dm) {
      return "";
    }

    const buff: any[] = [];
    this.directives.forEach((d) => {
      const val = dm.invokeDirective(d, this.context as DocProcContext);
      if (val !== null && val !== undefined) {
        buff.push(val);
      }
    });

    return buff.join("");
  }
}
