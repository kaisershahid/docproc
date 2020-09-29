/**
 * Baseline types/interfaces/helper classes to start extending Dinomark.
 *
 * ```
 * [@directive]: action (parameters)
 * ```
 */
import { AnyMap, DocContext, TypedMap } from "../../types";

export type DirectiveDefinition = {
  /**
   * The name of the directive handler (e.g. `var`, `include-vars`).
   */
  directive: string;
  /**
   * The type of context-specific action to perform. This could also be some sort of identifier, like a variable name.
   */
  action: string;
  /**
   * Extended data related to the directive and action.
   */
  parameters?: string;
};

type LooseContext = { vars?: AnyMap };

/**
 * Executes directive definition and returns a stringable object.
 */
export type DirectiveHandler = {
  invokeDirective: (def: DirectiveDefinition, ctx: DocContext) => any;
};

/**
 * Maps a directive/action to a handler.
 */
export class DirectivesManager implements DirectiveHandler {
  handlers: TypedMap<DirectiveHandler> = {};

  addHandler(
    handler: DirectiveHandler,
    def: {
      directive: string;
      action?: string;
    }
  ): this {
    const key = `${def.directive}.${def.action ?? ""}`;
    this.handlers[key] = handler;
    return this;
  }

  /**
   * Finds either the directive/action or directive handler for the given definition.
   * @param def
   * @param ctx
   */
  invokeDirective(def: DirectiveDefinition, ctx: DocContext): any {
    const key1 = `${def.directive}.${def.action ?? ""}`;
    const key2 = def.directive + ".";
    const handler = this.handlers[key1] ?? this.handlers[key2];
    return handler?.invokeDirective(def, ctx);
  }
}
