export type AnyMap = { [key: string]: any };

export type LexemeDef = {
	priority: number;
	/**
	 * If defined, can expect up to defined number of consecutive chars of the same token.
	 */
	upTo?: number;
	type?: string;
};

export type LexemeDefMap = {
	[key: string]: LexemeDef;
};

export type LexemeConsumer = (lexeme: string, def?: LexemeDef) => any;

export interface LexerInterface {
	setLexeme: (lexeme: string, def: LexemeDef) => LexerInterface;
	mergeLexemes: (map: LexemeDefMap, overwrite?: boolean) => LexerInterface;
	lex: (content: string, consumer: LexemeConsumer) => void;
}

export interface HandlerInterface {
	getName: () => string;
	push: LexemeConsumer;
}

export type HandlerAddOptions = {
	before?: string;
	after?: string;
	at?: string;
};

export interface HandlerManagerInterface {
	addHandler: (
		handler: HandlerInterface,
		options?: HandlerAddOptions
	) => HandlerManagerInterface;
	withHandlers: (callback: (handlers: HandlerInterface[]) => void) => void;
}

export interface StateInterface {
	vars: AnyMap;
	push: LexemeConsumer;
	getCurrentHandler: () => HandlerInterface | undefined;
	getBlockManager: () => HandlerManagerInterface;
	getInlineManager: () => HandlerManagerInterface;
}

export type DocContext = {
	lexer: LexerInterface;
	state: StateInterface;
};

export interface ContextAwareInterface {
	setContext: (context: DocContext) => void;
}
