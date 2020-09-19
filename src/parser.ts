import { HandlerManager } from "./handler-manager";
import {
	AnyMap,
	HandlerInterface,
	HandlerManagerInterface,
	LexemeConsumer,
	LexemeDef,
	StateInterface,
} from "./types";

export class Parser implements StateInterface {
	vars: AnyMap = {};
	protected cur: HandlerInterface | undefined;

	push(lex: string, def: LexemeDef | undefined) {
		if (!this.cur) {
			throw new Error("no current handler set");
		}

		return this.cur.push(lex, def);
	}

	getCurrentHandler(): HandlerInterface | undefined {
		return this.cur;
	}

	setCurrentHandler(handler?: HandlerInterface) {
		this.cur = handler;
	}
}
