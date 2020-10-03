import { HandlerManager } from "./handler-manager";
import { DocProcContext, HandlerInterface, HandlerManagerInterface, LexemeConsumer, LexerInterface, StateInterface, BlockHandlerType, InlineHandlerType, LexemeDef, AnyMap, PluginManagerInterface, PluginServicesManagerInterface, DataRegistryInterface } from "./types";
/**
 * Encapsulates management of lexer, parser, and all handlers.
 */
export declare class DocProcessor {
    protected id: number;
    protected lexer: LexerInterface;
    protected parser: StateInterface;
    vars: AnyMap;
    protected context: DocProcContext;
    protected blocks: HandlerInterface<BlockHandlerType>[];
    protected blockManager: HandlerManager<BlockHandlerType>;
    protected inlineManager: HandlerManager<InlineHandlerType>;
    protected pluginManager: PluginManagerInterface;
    protected pluginServicesManager: PluginServicesManagerInterface;
    protected dataRegistry: DataRegistryInterface;
    protected collector: LexemeConsumer;
    protected curHandlerDefers: boolean;
    constructor(context?: DocProcContext | AnyMap);
    makeContext(): DocProcContext;
    protected makeCollector(): LexemeConsumer;
    getLexer(): LexerInterface;
    getBlockManager(): HandlerManagerInterface<BlockHandlerType>;
    getInlineManager(): HandlerManagerInterface<InlineHandlerType>;
    getPluginManager(): PluginManagerInterface;
    getPluginServiceManager(): PluginServicesManagerInterface;
    protected findNewHandler(lexeme: string, def?: LexemeDef): HandlerInterface<BlockHandlerType>;
    protected setNewHandler(lexeme: string, def?: LexemeDef): void;
    /**
     * For string-based construction, use this.
     * @param content
     */
    process(content: string): void;
    /**
     * The primary use case for this is handlers that wrap their own docproc instance
     * and are forwarding lexemes.
     * @param lex
     * @param def
     */
    push(lex: string, def?: LexemeDef): this;
    toString(): string;
}
