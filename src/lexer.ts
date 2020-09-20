import { timeStamp } from "console";
import { col } from "sequelize";
import {
	LexemeDef,
	LexemeConsumer,
	LexerInterface,
	LexemeDefMap,
	LexemeLookaheadReturn,
	LEXEME_COMPLETE,
} from "./types";

const LEXEMES: { [key: string]: LexemeDef } = {
	"\n": { priority: 1 },
	"\r": { priority: 1 },
	"%": { priority: 98, upTo: 3 },
	"-": { priority: 98, upTo: 3 },
	"#": { priority: 98, upTo: 6 },
	"<": { priority: 2 },
	">": { priority: 2 },
	// @todo *
	// @todo |
};

/**
 * Emits lexemes from a string. Lexemes are either pre-defined or inferred.
 *
 * Pre-defined lexemes are 1 or more characters and have an intrinsic priority. For
 * lexemes that share the same prefix (e.g. `~` and `~~`), the priority determines
 * which lexeme to select.
 *
 * Pre-defined lexemes also have an optional parameter that defines `upTo` an expected
 * number of repetitions. For instance, `#` through `######` define headings. Rather
 * than defining 6 lexemes, you can simply define `#` with `{upTo:6}`.
 *
 * > Note that when defining something like `~ -> {priority:99,repeat:3}` and
 * > `~ -> {priority:100}`, `~~` will always be matched before `~~~`.
 *
 * Inferred lexemes are those that don't contain pre-defined lexemes.
 */
export class Lexer implements LexerInterface {
	protected definedLexemes: LexemeDefMap = {};
	protected _lex: string = "";
	protected _lex_def: LexemeDef | undefined = undefined;

	reset(): LexerInterface {
		this._lex = "";
		this._lex_def = undefined;
		return this;
	}

	complete(collector: LexemeConsumer): LexerInterface {
		// emit the last lexeme before complete
		if (this._lex !== "") {
			collector(this._lex, this._lex_def);
		}

		this._lex = LEXEME_COMPLETE;
		this._lex_def = undefined;
		collector(this._lex, this._lex_def);

		return this;
	}

	setLexeme(lexeme: string, def: LexemeDef): LexerInterface {
		this.definedLexemes[lexeme] = def;
		return this;
	}

	mergeLexemes(map: LexemeDefMap, overwrite?: boolean): LexerInterface {
		for (const lex of Object.keys(map)) {
			if (overwrite || !this.definedLexemes[lex]) {
				this.definedLexemes[lex] = map[lex];
			}
		}
		return this;
	}

	lex(content: string, collector: LexemeConsumer): LexerInterface {
		let i = 0;
		let end = content.length;

		// accumulates tokens that represent either a defined or unstructured lexeme
		let lex = this._lex;
		// if set, indicates lex is a defined lexeme
		let lex_def = this._lex_def;
		// current token
		let ctok = "";

		/* high-level overview
		- create $lex_tmp as $lex + $ctok
		- set $lex_tmp_def to lexeme definition if available
		- if $lex_def and $lex_tmp_def are both set
		  - indicates $lex is a prefix of $lex_tmp
		  - if $lex_tmp has a higher priority, set current lexeme to $lex_tmp_def
			and move to next token
		  - otherwise, continue as normal
		- if $lex_tmp_def is set but $lex_def isn't
		  - set $lex to $lex_tmp and move to next token
		- if $lex_def is set
		  - if non-repeating, emit $lex and set $lex = '' (RESET)
		  - otherwise, attempt to find upTo occurrences of $lex and emit single string
		  - set $lex = '' (RESET)
		- if $ctok is a lexeme
		  - emit $lex if not empty, then set $lex = $ctok
		- otherwise,
		  - append $ctok to $lex
		
		repeat until all tokens are consumed
		*/

		/**
		 *
		 * @param def
		 * @param lexeme
		 */
		const _execute_lookahead = (def: LexemeDef, lexeme: string) => {
			const {
				nextIndex,
				newLexeme,
				newLexemeDef,
			}: LexemeLookaheadReturn = def.lookahead
				? def.lookahead(content, lexeme, i)
				: {};
			i = nextIndex ?? i;
			collector(newLexeme ?? lexeme, newLexemeDef ?? def);
		};

		/**
		 * Given the token definition and token, attempt to match repeated occurrences,
		 * emitting up to the maximum number of occurrences. If non-repeating, emit token.
		 * @param def
		 * @param lexeme
		 */
		const _find_repeats_and_emit = (
			def: LexemeDef,
			lexeme: string
		): undefined | string => {
			if (def.lookahead) {
				_execute_lookahead(def, lexeme);
				return;
			}
			if (def.upTo === undefined) {
				collector(lexeme, lex_def);
				return;
			}

			let buff = lexeme;
			const mtok = lexeme;
			const incr = mtok.length;
			let count = 1;
			for (
				let j = i;
				count <= def.upTo && j < content.length;
				j += incr
			) {
				const subtok = content.substr(j, incr);
				if (subtok == mtok) {
					buff += subtok;
					i = j + incr;
					count++;
				} else {
					break;
				}
			}

			collector(buff, lex_def);
		};

		const _eval_token = () => {
			let lex_tmp = lex + ctok;
			let lex_tmp_def: LexemeDef | undefined = this.definedLexemes[
				lex_tmp
			];
			// console.log("<", { i, ctok, lex, lex_def });
			// console.log(" ", { lex_tmp, lex_tmp_def });

			// previous token is prefix of current token.
			// if cur token's priority is higher, set cur token to this
			// otherwise, emit last token and reset
			if (lex_def && lex_tmp_def) {
				if (lex_def.priority < lex_tmp_def.priority) {
					lex = lex_tmp;
					lex_def = lex_tmp_def;
					i++;
					return;
				} else {
					lex_tmp_def = undefined;
				}
			}

			// tok is not an explicitly defined token but tok_tmp is,
			// so set tok to tok_tmp
			if (lex_tmp_def) {
				lex = lex_tmp;
				lex_def = lex_tmp_def;
				i++;
				return;
			}

			// new char does not continue previous token. if it's repeatable, attempt to
			// gather upTo repetitions then emit
			if (lex_def) {
				_find_repeats_and_emit(lex_def, lex);
				ctok = content[i];
				lex = "";
				lex_def = undefined;
			}

			// current char is a special token -- emit current tok and set to char
			if (this.definedLexemes[ctok]) {
				if (lex != "") {
					collector(lex, lex_def);
				}

				lex = ctok;
				lex_def = this.definedLexemes[ctok];
			} else if (ctok !== undefined) {
				// just a plain ol character being added to a word
				lex += ctok;
			}

			i++;
		};

		while (i < end) {
			ctok = content[i];
			_eval_token();
		}

		this._lex = lex;
		this._lex_def = lex_def;
		return this;
	}
}
