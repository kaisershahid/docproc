import {
  BlockHandlerType,
  DocProcContext,
  HandlerInterface,
  PluginServicesManagerInterface,
} from "../../types";
import { DINO_LEX_BLOCK } from "./lexemes";
import {
  Linkref,
  LinkrefParagraphHandler,
} from "../markdown/linkref-paragraph";
import {
  DirectiveDefinition,
  DirectivesManager,
  DINOMARK_SERVICE_DIRECTIVE,
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

  lastLink?: Linkref;

  handlerEnd() {
    // @todo state checks
    if (this.lastLink === this.linkref) {
      return;
    }

    this.directives.push({
      directive: this.linkref.key,
      action: this.linkref.url,
      parameters: this.linkref.comment,
    });
    this.lastLink = this.linkref;
  }

  toString(): string {
    this.handlerEnd();
    const dm: DirectivesManager | undefined = (this.context
      ?.pluginServicesManager as PluginServicesManagerInterface).getService(
      "dinomark",
      DINOMARK_SERVICE_DIRECTIVE
    );

    if (!dm) {
      return "";
    }

    const buff: any[] = [];
    this.directives.forEach((d) => {
      buff.push(dm.invokeDirective(d, this.context as DocProcContext));
    });

    return buff.join("");
  }
}
