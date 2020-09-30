import { InlineStateBuffer } from "./inline/state-buffer";
import { DocProcessor } from "./doc-processor";

export type AnyMap = { [key: string]: any };
export type TypedMap<T> = { [key: string]: T };

export type LexemeDef = {
  priority: number;
  /**
   * If defined, can expect up to defined number of consecutive chars of the same token.
   */
  upTo?: number;
  type?: string;
  lookahead?: (
    content: string,
    lexeme: string,
    nextIdx: number,
    curDef: LexemeDef
  ) => LexemeLookaheadReturn | any;
};

export type LexemeLookaheadReturn = {
  nextIndex?: number;
  newLexeme?: string;
  newLexemeDef?: LexemeDef;
};

export type LexemeDefMap = {
  [key: string]: LexemeDef;
};

export type LexemePair = {
  lexeme: string;
  def?: LexemeDef;
};

/**
 * The lexeme to emit once a document is complete. Since this isn't emitted in the normal
 * course of `lex()`, this value is reasonable.
 */
export const LEXEME_COMPLETE = "";

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
  setContext: (context: DocContext) => void;
}

export class GenericHandlerType {}
export class BlockHandlerType extends GenericHandlerType {}
export class InlineHandlerType extends GenericHandlerType {}

export interface HandlerInterface<T extends GenericHandlerType>
  extends ContextAwareInterface {
  getName: () => string;
  canAccept: (lexeme: string, def?: LexemeDef) => boolean;
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

export enum BlockActions {
  DEFER = "defer",
  CONTINUE = "continue",
  DONE = "done",
  REJECT = "reject",
}

export type HandlerAddOptions = {
  before?: string;
  after?: string;
  at?: string;
};

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

export interface InlineFormatterInterface {
  push: LexemeConsumer;
}

export const InlineFormatterDummy: InlineFormatterInterface = {
  push: (lex, def) => {
    throw new Error("inlineFormatter: did you forget to setContext()?");
  },
};

export type PluginMapping = { name: string; path: string };

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
};

export type PluginOptions = AnyMap;

export type PluginEntry = (doc: DocProcessor, opts?: PluginOptions) => void;

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
 * Baseline input/output context for the document.
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

export type DocContext = {
  /**
   * A globally available map holding dynamic data. Can be read from/written to depending on what loaded plugins allow.
   */
  vars:
    | AnyMap
    | {
        sys: SysSettings;
      };
  lexer: LexerInterface;
  state: StateInterface; // @todo deprecate
  blockManager: HandlerManagerInterface<BlockHandlerType>;
  inlineManager: HandlerManagerInterface<InlineHandlerType>;
  pluginManager: PluginManagerInterface;
  pluginServicesManager: PluginServicesManagerInterface;
  getInlineFormatter: () => InlineFormatterInterface;
};
