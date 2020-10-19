/**
 * Baseline types/interfaces/helper classes to start extending Dinomark.
 *
 * ```
 * [@directive]: action (parameters)
 * ```
 */
import { BlockHandlerType, DocProcContext, HandlerInterface, TypedMap } from "../../types";
export declare type DirectiveDefinition = {
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
/**
 * Executes directive definition and returns a stringable object.
 */
export declare type DirectiveHandler = {
    invokeDirective: (def: DirectiveDefinition, ctx: DocProcContext) => any;
    modifyBlocks?: (blocks: HandlerInterface<BlockHandlerType>[], def: DirectiveDefinition, context: DocProcContext) => HandlerInterface<BlockHandlerType>[];
};
export declare const DINOMARK_SERVICE_DIRECTIVE = "directive-manager";
/**
 * Maps a directive/action to a handler.
 */
export declare class DirectivesManager implements DirectiveHandler {
    handlers: TypedMap<DirectiveHandler>;
    addHandler(handler: DirectiveHandler, def: {
        directive: string;
        action?: string;
    }): this;
    getHandler(def: DirectiveDefinition): DirectiveHandler | undefined;
    /**
     * Finds either the directive/action or directive handler for the given definition.
     * @param def
     * @param ctx
     */
    invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any;
}
