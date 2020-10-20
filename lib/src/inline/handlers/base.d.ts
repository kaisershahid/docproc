import { InlineHandlerInterface } from "../index";
import { DocProcContext, HandlerInterface, InlineActions, InlineHandlerType, LexemeDef } from "../../types";
export declare class BaseHandler implements InlineHandlerInterface {
    private _parent;
    private _children;
    protected _context?: DocProcContext;
    protected words: any[];
    constructor();
    getChildren(): InlineHandlerInterface[];
    addChild(value: HandlerInterface<InlineHandlerType>): InlineHandlerInterface;
    getParent(): InlineHandlerInterface | null;
    setParent(parent: InlineHandlerInterface): InlineHandlerInterface;
    setContext(context: DocProcContext): void;
    nextAction(lexeme: string): InlineActions;
    canAccept(lexeme: string): boolean;
    cloneInstance(): HandlerInterface<InlineHandlerType>;
    getName(): string;
    push(lexeme: string, def: LexemeDef | undefined): any;
    toString(): string;
}
