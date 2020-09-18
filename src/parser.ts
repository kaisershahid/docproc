import {
	AnyMap,
	HandlerInterface,
	HandlerManagerInterface,
	LexemeConsumer,
	StateInterface,
} from "./types";

export class Parser implements StateInterface {
	vars: AnyMap = {};
	cur: HandlerInterface | undefined;

	push(lex, def) {
		//
	}

	getCurrentHandler(): HandlerInterface | undefined {
		return this.cur;
	}

	getBlockManager(): HandlerManagerInterface {
		//
	}

	getInlineManager(): HandlerManagerInterface {
		//
	}
}
