import {
  DocContext,
  HandlerAddOptions,
  HandlerInterface,
  HandlerManagerInterface,
} from "./types";

export const insertBefore = <T>(handler: T, idx: number, handlers: T[]) => {
  if (idx == -1) {
    return [handler, ...handlers];
  } else {
    return [
      ...handlers.splice(0, idx),
      handler,
      ...handlers.splice(idx, handlers.length),
    ];
  }
};

export const insertAfter = <T>(handler: T, idx: number, handlers: T[]) => {
  if (idx == -1) {
    return [...handlers, handler];
  } else {
    return [
      ...handlers.splice(0, idx + 1),
      handler,
      ...handlers.splice(idx + 1, handlers.length),
    ];
  }
};

export const NAME_DEFAULT = "DEFAULT";

export class HandlerManager<T> implements HandlerManagerInterface<T> {
  handlers: HandlerInterface<T>[] = [];
  defaultHandler?: HandlerInterface<T>;
  context?: DocContext;

  setContext(context: DocContext) {
    this.context = context;
    this.handlers.forEach((h) => h.setContext(context));
  }

  findHandlerIndex(name: string | null | undefined): number {
    let idx = -1;
    this.handlers.forEach((handler, i) => {
      if (handler.getName() == name) {
        idx = i;
      }
    });

    return idx;
  }

  addHandler(
    handler: HandlerInterface<T>,
    options?: HandlerAddOptions | undefined
  ): HandlerManagerInterface<T> {
    if (handler.getName() == NAME_DEFAULT) {
      this.defaultHandler = handler;
      return this;
    }

    const opts = options ?? {};

    if (opts.before) {
      this.handlers = insertBefore(
        handler,
        this.findHandlerIndex(opts.before),
        this.handlers
      );
    } else if (opts.after) {
      this.handlers = insertAfter(
        handler,
        this.findHandlerIndex(opts.after),
        this.handlers
      );
    } else if (opts.at) {
      const idx = this.findHandlerIndex(opts.at);
      if (idx == -1) {
        this.handlers.push(handler);
      } else {
        this.handlers[idx] = handler;
      }
    } else {
      this.handlers.push(handler);
    }

    return this;
  }

  withHandlers(callback: (handlers: HandlerInterface<T>[]) => void) {
    const handlers = [...this.handlers];
    if (this.defaultHandler) handlers.push(this.defaultHandler);
    callback(handlers);
  }

  getNames(): string[] {
    return this.handlers.map((h) => h.getName());
  }
}
