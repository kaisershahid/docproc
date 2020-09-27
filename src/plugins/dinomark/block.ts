import { BlockBase } from "../../defaults/block-base";
import { BlockHandlerType, HandlerInterface } from "../../types";
import { DINO_LEX_BLOCK } from "./lexemes";
import {
  Linkref,
  LinkrefParagraphHandler,
} from "../markdown/linkref-paragraph";

export type DirectiveDefinition = {
  directive: string;
  action: string;
  parameters?: string;
};

export class DinoBlockHandler extends LinkrefParagraphHandler {
  lexStart = DINO_LEX_BLOCK;
  directives: DirectiveDefinition[] = [];

  cloneInstance(): HandlerInterface<BlockHandlerType> {
    return new DinoBlockHandler();
  }

  getName(): string {
    return "dinomark:block-linkref";
  }

  handlerEnd() {
    // @todo state checks
    this.directives.push({
      directive: this.linkref.key,
      action: this.linkref.url,
      parameters: this.linkref.comment,
    });
  }

  toString(): string {
    // @todo execute directives
    return "";
  }
}
