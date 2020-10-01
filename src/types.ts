import { InlineStateBuffer } from "./inline/state-buffer";
import { DocProcessor } from "./doc-processor";

export type AnyMap = { [key: string]: any };
export type TypedMap<T> = { [key: string]: T };

export type LexemeDef = {
  /**
   * Used for tie-breaking lexemes with the same prefix.
   */
  priority: number;
  /**
   * If defined, can expect up to defined number of consecutive chars of the same token.
   */
  upTo?: number;
  /**
   * General categorization of the lexeme (e.g. 'number', 'word', 'operator', etc.)
   */
  type?: string;
  /**
   * Callback allows for full control of token lookahead. Useful when a single lexeme is the prefix for a wider range
   * of lexemes (e.g. `<<` versus `<tag>`)
   * @param content The input source
   * @param lexeme The lexeme prefix
   * @param nextIdx The position in `content` after `lexeme`
   * @param curDef The current lexeme definition
   */
  lookahead?: (
    content: string,
    lexeme: string,
    nextIdx: number,
    curDef: LexemeDef
  ) => LexemeLookaheadReturn | any;
};

/**
 * The return value from the lookahead determines which lexeme to emit and how far ahead to jump in the input.
 */
export type LexemeLookaheadReturn = {
  /**
   * If defined, must specify an index greater than or equal to `nextIdx` provided to the lookahead callback.
   */
  nextIndex?: number;
  /**
   * If defined, the lexeme to emit.
   */
  newLexeme?: string;
  /**
   * If defined, the lexeme definition to emit.
   */
  newLexemeDef?: LexemeDef;
};

export type LexemeDefMap = {
  [key: string]: LexemeDef;
};

/**
 * Can be used to create an undo/replay buffer. {@see LinkrefParagraphHandler} is an example use case.
 */
export type LexemePair = {
  lexeme: string;
  def?: LexemeDef;
};

/**
 * The lexeme to emit once a document is complete. Since this isn't emitted in the normal
 * course of `lex()`, this value is reasonable.
 */
export const LEXEME_COMPLETE = "";

/**
 * A general callback that's given to the lexer to pipe lexemes to. The return type depends on how the consumer is
 * used -- for block and inline handlers, this returns control flow status.
 */
export type LexemeConsumer = (lexeme: string, def?: LexemeDef) => any;

/**
 * @todo add unsetLexeme(lexeme)
 */
export interface LexerInterface {
  /**
   * Sets a single lexeme definition.
   */
  setLexeme: (lexeme: string, def: LexemeDef) => LexerInterface;
  /**
   * Merge a map of lexeme definitions. with the option to overwrite existing values (default should ignore).
   */
  mergeLexemes: (map: LexemeDefMap, overwrite?: boolean) => LexerInterface;
  /**
   * Reset all state values for a new document.
   */
  reset: () => LexerInterface;
  /**
   * Starts/resumes lexing for a document.
   */
  lex: (content: string, consumer: LexemeConsumer) => LexerInterface;
  /**
   * Emits `LEXEME_COMPLETE` to close out document processing.
   */
  complete: (consumer: LexemeConsumer) => LexerInterface;
}

export interface ContextAwareInterface {
  /**
   * Allows the object (typically a handler) to receive the processor context.
   * @param context
   */
  setContext: (context: DocProcContext) => void;
}

/**
 * Empty classes that are used as generics for the handler interface.
 */
export class GenericHandlerType {}
export class BlockHandlerType extends GenericHandlerType {}
export class InlineHandlerType extends GenericHandlerType {}

export interface HandlerInterface<T extends GenericHandlerType>
  extends ContextAwareInterface {
  /**
   * A unique, human-friendy name for the handler. Used to position and prioritize other handlers.
   */
  getName: () => string;
  /**
   * Returns true if the handler can accept this lexeme as starting input.
   * @param lexeme
   * @param def
   */
  canAccept: (lexeme: string, def?: LexemeDef) => boolean;
  /**
   * Gives the handler a lexeme. Handler can either consume or reject it.
   */
  push: LexemeConsumer;
  /**
   * If available, this method will be called when the document ends to allow for any cleanup
   * of the last handler. This generally is needed when the document doesn't terminate with
   * a new line.
   */
  handlerEnd?: () => void;
  /**
   * Return a new instance of the current handler with any relevant properties propagated to it.
   */
  cloneInstance: () => HandlerInterface<T>;
}

/**
 * Control flow statuses for blocks.
 */
export enum BlockActions {
  /**
   * Active block accepts the current lexeme but will defer the next lexeme to a better handler if found.
   */
  DEFER = "defer",
  /**
   * Active block accepts the current lexeme and will continue accepting.
   */
  CONTINUE = "continue",
  /**
   * Active block accepts the current lexeme but will no longer accept new ones.
   */
  DONE = "done",
  /**
   * Active block rejects the current lexeme (retry with another handler) and will no longer accept new ones.
   */
  REJECT = "reject",
}

/**
 * Positional arguments for where to insert a new handler.
 */
export type HandlerAddOptions = {
  before?: string;
  after?: string;
  at?: string;
};

// @todo getHandler(name)
export interface HandlerManagerInterface<T extends GenericHandlerType>
  extends ContextAwareInterface {
  addHandler: (
    handler: HandlerInterface<T>,
    options?: HandlerAddOptions
  ) => HandlerManagerInterface<T>;
  withHandlers: (callback: (handlers: HandlerInterface<T>[]) => void) => void;
}

export interface StateInterface {
  vars: AnyMap;
  push: LexemeConsumer;
  getCurrentHandler: () => HandlerInterface<BlockHandlerType> | undefined;
  setCurrentHandler: (handler?: HandlerInterface<BlockHandlerType>) => void;
}

/**
 * Control flow statuses for inline handler.
 */
export enum InlineActions {
  /**
   * If a specific handler is registered for a lexeme, use that instead of current one
   * if available (otherwise, continue using current handler).
   */
  DEFER,
  /**
   * Subsequent lexemes will be given to this handler until it finds a closing lexeme.
   */
  NEST,
  /**
   * Continue accepting lexemes.
   */
  CONTINUE,
  /**
   * Closing lexeme encountered and consumed. Take current handler off stack.
   */
  POP,
  /**
   * Lexeme not accepted. Take current handler off stack and retry with parent.
   */
  REJECT,
}

/**
 * General interface for building inline content.
 */
export interface InlineFormatterInterface {
  push: LexemeConsumer;
}

/**
 * Use this default to concretely initialize a formatter instance (that can be changed later). Avoids null checks.
 */
export const InlineFormatterDummy: InlineFormatterInterface = {
  push: (lex, def) => {
    throw new Error("inlineFormatter: did you forget to setContext()?");
  },
};

/**
 * Basic mapping of a plugin name to a plugin module path.
 */
export type PluginMapping = { name: string; path: string };

/**
 * Maps a plugin name to document options for the plugin.
 */
export type PluginOptionsMap = { [key: string]: PluginOptions };

/**
 * Generally kept as a JSON file in your document root, this file contains settings for
 * plugins as well as other metadata.
 */
export type DocumentSettings = AnyMap & {
  /**
   * Extended plugins for your doc, mapped as either as an npm package or a relative path.
   *
   * ```{name: "markdown", modPath: "./plugins/markdown"}```
   */
  plugins: PluginMapping[];
  /**
   * Maps a plugin name to custom settings for the plugin.
   */
  pluginOptions: PluginOptionsMap;
  /**
   * General metadata.
   */
  metadata: AnyMap;
};

/**
 * Generic map to supply/override a plugin's configuration.
 */
export type PluginOptions = AnyMap;

/**
 * Hook that allows a plugin to inject itself into the processor.
 */
export type PluginEntry = (doc: DocProcessor, opts?: PluginOptions) => void;

/**
 * Tracks registered plugins and provides convenient way to attach plugins to the processor.
 */
export interface PluginManagerInterface {
  register: (name: string, entrypoint: PluginEntry) => void;
  registerFromModule: (name: string, modPath: string) => void;
  isAvailable: (name: string) => boolean;
  attach: (
    name: string,
    docproc: DocProcessor,
    opts?: PluginOptions
  ) => DocProcessor;
}

/**
 * A registry of services grouped by their plugins. This allows other plugins to extend behaviors of the
 * plugin's handlers.
 */
export interface PluginServicesManagerInterface {
  addService: (pluginName: string, key: string, provider: any) => void;
  addServices: (pluginName: string, services: AnyMap) => void;
  getService: <T>(pluginName: string, key: string) => T | undefined;
}

/**
 * Allows handlers to append items to a global data registry, with items being tied to a category.
 *
 * For instance, the {@see HeaderHandler} can add each header that it generates as part of `headers`, and another
 * handler (like table of contents) can use that data to generate its content.
 */
export interface DataRegistryInterface {
  addItem: (category: string, item: AnyMap) => void;
  addItems: (category: string, items: AnyMap[]) => void;
  getItems: (category: string) => AnyMap[];
  count: (category: string) => number;
}

/**
 * Baseline input/output context for the document. Available as `DocProcContext.vars.sys`.
 */
export type SysSettings = {
  /**
   * Metadata for the input document.
   */
  doc: {
    /**
     * Directory root of doc.
     */
    dir: string;
    /**
     * Filename of doc.
     */
    name: string;
    /**
     * `dir + '/' + name`
     */
    path: string;
    /**
     * Document extension.
     */
    ext: string;
    settingsDir: string;
    settingsName: string;
    settings: DocumentSettings;
  };
};

/**
 * Data and services that define a specific document's processing context.
 */
export type DocProcContext = {
  /**
   * A globally available map holding dynamic data. Can be read from/written to depending on what loaded plugins allow.
   */
  vars:
    | AnyMap
    | {
        sys: SysSettings;
      };
  /**
   * Core lexer. Defaults to {@see Lexer}.
   */
  lexer: LexerInterface;
  state: StateInterface; // @todo deprecate
  /**
   * Manages block handlers. Defaults to {@see HandlerManager}
   */
  blockManager: HandlerManagerInterface<BlockHandlerType>;
  /**
   * Manages inline handlers. Defaults to {@see HandlerManager}
   */
  inlineManager: HandlerManagerInterface<InlineHandlerType>;
  /**
   * Manages plugins. Defaults to {@see PluginManager}
   */
  pluginManager: PluginManagerInterface;
  /**
   * Manages plugin services. Defaults to {@see PluginServicesManager}
   */
  pluginServicesManager: PluginServicesManagerInterface;
  /**
   * Data registry service.
   */
  dataRegistry: DataRegistryInterface;
  /**
   * Creates an instance of an line formatter. Typically called when the handler's `setContext()` method is invoked.
   */
  getInlineFormatter: () => InlineFormatterInterface;
};
