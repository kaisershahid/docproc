import { DocProcContext, HandlerAddOptions, HandlerInterface, HandlerManagerInterface } from "./types";
export declare const insertBefore: <T>(handler: T, idx: number, handlers: T[]) => T[];
export declare const insertAfter: <T>(handler: T, idx: number, handlers: T[]) => T[];
export declare const NAME_DEFAULT = "DEFAULT";
export declare class HandlerManager<T> implements HandlerManagerInterface<T> {
    handlers: HandlerInterface<T>[];
    defaultHandler?: HandlerInterface<T>;
    context?: DocProcContext;
    setContext(context: DocProcContext): void;
    findHandlerIndex(name: string | null | undefined): number;
    addHandler(handler: HandlerInterface<T>, options?: HandlerAddOptions | undefined): HandlerManagerInterface<T>;
    withHandlers(callback: (handlers: HandlerInterface<T>[]) => void): void;
    getNames(): string[];
}
