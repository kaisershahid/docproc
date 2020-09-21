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
    i: number
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
  canAccept: (lexeme: string) => boolean;
  push: LexemeConsumer;
  /**
   * Returns a fresh clone of the handler.
   */
  cloneInstance: () => HandlerInterface<T>;
}

export enum AfterPushStatus {
  CONTINUE,
  DONE,
  REJECT,
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

export type DocContext = {
  lexer: LexerInterface;
  state: StateInterface;
};
