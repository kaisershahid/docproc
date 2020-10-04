"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocProcessor = void 0;
const handler_manager_1 = require("./handler-manager");
const lexer_1 = require("./lexer");
const parser_context_1 = require("./parser-context");
const types_1 = require("./types");
const state_buffer_1 = require("./inline/state-buffer");
const paragraph_handler_1 = require("./defaults/paragraph-handler");
const plugins_1 = require("./plugins");
const data_registry_1 = require("./data-registry");
let id = 0;
/**
 * Encapsulates management of lexer, parser, and all handlers.
 * @todo add eventing support: beforeClose, afterClose
 */
class DocProcessor {
    constructor(context) {
        this.vars = {};
        this.blocks = [];
        this.curHandlerDefers = false;
        this.id = ++id;
        const { lexer, parser, blockManager, inlineManager, vars, pluginManager, pluginServicesManager, dataRegistry, } = context ?? {};
        this.lexer = lexer ?? new lexer_1.Lexer();
        this.parser = parser ?? new parser_context_1.ParserContext();
        this.blockManager = blockManager ?? new handler_manager_1.HandlerManager();
        this.inlineManager = inlineManager ?? new handler_manager_1.HandlerManager();
        this.pluginManager = pluginManager ?? plugins_1.getPluginManager();
        this.pluginServicesManager =
            pluginServicesManager ?? plugins_1.getPluginServicesManager();
        this.dataRegistry = dataRegistry ?? data_registry_1.makeDataRegistry();
        this.vars = vars ?? {};
        this.context = this.makeContext();
        this.blockManager.setContext(this.context);
        this.inlineManager.setContext(this.context);
        this.collector = this.makeCollector();
    }
    makeContext() {
        const context = {
            lexer: this.lexer,
            state: this.parser,
            blockManager: this.blockManager,
            inlineManager: this.inlineManager,
            pluginManager: this.pluginManager,
            pluginServicesManager: this.pluginServicesManager,
            dataRegistry: this.dataRegistry,
            vars: this.vars,
            getInlineFormatter: () => {
                return new state_buffer_1.InlineStateBuffer(context);
            },
        };
        return context;
    }
    makeCollector() {
        // @todo collect char/line info
        // @todo if lexemes immediately after newline are whitespace, buffer first until first non-whitespace
        // @todo if line is blank or entirely whitespace, ignore
        const endCurrentHandler = () => {
            const h = this.parser.getCurrentHandler();
            if (h?.handlerEnd) {
                h.handlerEnd();
            }
            return;
        };
        return (lexeme, def) => {
            if (lexeme === types_1.LEXEME_COMPLETE) {
                endCurrentHandler();
            }
            // previous lexeme signalled that if there's a better handler for current
            // lexeme to use that
            if (this.curHandlerDefers) {
                this.curHandlerDefers = false;
                let newHandler = this.findNewHandler(lexeme, def);
                if (newHandler.getName() != this.parser.getCurrentHandler()?.getName()) {
                    endCurrentHandler();
                    newHandler = newHandler.cloneInstance();
                    newHandler.setContext(this.context);
                    this.blocks.push(newHandler);
                    this.parser.setCurrentHandler(newHandler);
                }
            }
            if (!this.parser.getCurrentHandler()) {
                this.setNewHandler(lexeme, def);
            }
            const result = this.parser.push(lexeme, def);
            if (result == types_1.BlockActions.DEFER) {
                this.curHandlerDefers = true;
            }
            else if (result == types_1.BlockActions.DONE) {
                this.parser.setCurrentHandler(undefined);
            }
            else if (result == types_1.BlockActions.REJECT) {
                this.parser.setCurrentHandler(undefined);
                this.setNewHandler(lexeme, def);
                if (this.parser.push(lexeme, def) === types_1.BlockActions.REJECT) {
                    // @todo include char/line
                    throw new Error(`cannot find a default blockHandler. unable to process lexeme: ${lexeme} (${def})`);
                }
            }
        };
    }
    getLexer() {
        return this.lexer;
    }
    getBlockManager() {
        return this.blockManager;
    }
    getInlineManager() {
        return this.inlineManager;
    }
    getPluginManager() {
        return this.pluginManager;
    }
    getPluginServiceManager() {
        return this.pluginServicesManager;
    }
    getDataRegistry() {
        return this.dataRegistry;
    }
    findNewHandler(lexeme, def) {
        const eligible = [];
        this.blockManager.withHandlers((handlers) => {
            handlers.forEach((h) => {
                if (h.canAccept(lexeme, def)) {
                    eligible.push(h);
                }
            });
        });
        return eligible[0]?.cloneInstance() ?? new paragraph_handler_1.ParagraphHandler();
    }
    setNewHandler(lexeme, def) {
        const contentBlock = this.findNewHandler(lexeme, def);
        contentBlock.setContext(this.context);
        this.blocks.push(contentBlock);
        this.parser.setCurrentHandler(contentBlock);
    }
    /**
     * For string-based construction, use this.
     * @param content
     */
    process(content) {
        this.lexer.reset().lex(content, this.collector);
        this.lexer.complete(this.collector);
        // @todo need state.finishDoc()
    }
    // @todo need streamPush(content:string) to call this.lexer.lex(content) only
    // (this aids in chunked content being received)
    /**
     * The primary use case for this is handlers that wrap their own docproc instance
     * and are forwarding lexemes.
     * @param lex
     * @param def
     */
    push(lex, def) {
        this.collector(lex, def);
        return this;
    }
    complete() {
        this.lexer.complete(this.collector);
    }
    toString() {
        return this.blocks.join("\n");
    }
    cloneInstance() {
        return new DocProcessor(this.makeContext());
    }
}
exports.DocProcessor = DocProcessor;
