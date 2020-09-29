import { BlockHandlerType, DocContext, HandlerInterface } from "../../types";
import { DINO_LEX_BLOCK } from "./lexemes";
import {
  Linkref,
  LinkrefParagraphHandler,
} from "../markdown/linkref-paragraph";
import { DirectiveDefinition, DirectivesManager } from "./directives";

export const KEY_PROVIDER_DIRECTIVE = "provider.dinomark.directive-manager";

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
    const dm: DirectivesManager | undefined = this.context?.vars[
      KEY_PROVIDER_DIRECTIVE
    ];

    if (!dm) {
      return "";
    }

    const buff: any[] = [];
    this.directives.forEach((d) => {
      buff.push(dm.invokeDirective(d, this.context as DocContext));
    });

    return buff.join("");
  }
}
