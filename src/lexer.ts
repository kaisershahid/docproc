import {
  LexemeDef,
  LexemeConsumer,
  LexerInterface,
  LexemeDefMap,
  LexemeLookaheadReturn,
  LEXEME_COMPLETE,
} from "./types";

export const LEXEME_KEY_ALPHA = "_@_@_alpha";

export const alphabetDefinition: LexemeDef = {
  priority: 1,
  type: "word",
  lookahead: (content, lexeme, i) => {
    // move position back -- lexeme may contain an invalid boundary character
    i -= lexeme.length;
    const match = content.substr(i).match(/([a-zA-Z]+)/);
    if (match) {
      return {
        newLexeme: match[1],
        nextIndex: i + match[1].length,
      };
    }
  },
};

export const LEXEME_KEY_NUM = "_@_@_num";

/**
 * Default definition for numbers matching:
 *
 * - whole numbers (`/\d+/`)
 * - fractional numbers (`/\d+\.\d+/`)
 * - loose hexadecimal (`/\dx[\da-zA-Z]+/`)
 * - exponential (`\d+e-?\d+/`)
 */
export const numberDefinition: LexemeDef = {
  priority: 1,
  type: "number",
  lookahead: (content, lexeme, i) => {
    // move position back -- lexeme may contain an invalid boundary character
    i -= lexeme.length;
    const substr = content.substr(i);
    let match = substr.match(
      /^(\d+(\.\d+|)e-?\d+(\.\d+|)|\d*\.\d+|x[\da-fA-F]+|\d+)/
    );
    if (match) {
      return {
        newLexeme: match[1],
        nextIndex: i + match[1].length,
      };
    }
  },
};

export const backslashDefinition: LexemeDef = {
  priority: 1,
  type: "escape",
  lookahead: (content, lexeme, i) => {
    return {
      newLexeme: lexeme + content[i],
      nextIndex: i + 1,
    };
  },
};

const _a = "a".charCodeAt(0);
const _z = "z".charCodeAt(0);
const _A = "A".charCodeAt(0);
const _Z = "Z".charCodeAt(0);
const _0 = "0".charCodeAt(0);
const _9 = "9".charCodeAt(0);

const isNumeric = (char: string) => {
  const code = char.charCodeAt(0);
  return code >= _0 && code <= _9;
};

const isAlphabetic = (char: string) => {
  const code = char.charCodeAt(0);
  return (code >= _a && code <= _z) || (code >= _A && code <= _Z);
};

/**
 * Reference lexer. Default instance contains following ability:
 *
 * - differentiate words with {@see alphabetDefinition}
 * - differentiate numbers with {@see numberDefinition}
 * - handle escaped character
 *
 * definitions.
 */
export class Lexer implements LexerInterface {
  protected definedLexemes: LexemeDefMap = {
    [LEXEME_KEY_ALPHA]: alphabetDefinition,
    [LEXEME_KEY_NUM]: numberDefinition,
    "\\": backslashDefinition,
  };
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

  /**
   * Attempt to map given lexeme to a definition. If a direct match isn't found, check if the first
   * character matches either an alphabet or number (defined by lexemes
   * {@see LEXEME_KEY_ALPHA} and {@see LEXEME_KEY_NUM}).
   */
  findDefinition(lexeme: string): LexemeDef | undefined {
    if (lexeme === undefined) {
      return;
    }

    if (this.definedLexemes[lexeme]) {
      return this.definedLexemes[lexeme];
    }

    if (isAlphabetic(lexeme[0])) {
      //  && isAlphabetic(lexeme[lexeme.length - 1])
      return this.definedLexemes[LEXEME_KEY_ALPHA];
    } else if (isNumeric(lexeme[0])) {
      //  && isNumeric(lexeme[lexeme.length - 1])
      return this.definedLexemes[LEXEME_KEY_NUM];
    }

    return;
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

    /* high-level overview @todo move to readme
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
        ? def.lookahead(content, lexeme, i) ?? {}
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
      for (let j = i; count <= def.upTo && j < content.length; j += incr) {
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
      let lex_tmp_def: LexemeDef | undefined = this.findDefinition(lex_tmp);
      // console.log("_eval_token", { i, ctok, lex, lex_def });
      // console.log("   ", { lex_tmp, lex_tmp_def });

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
      if (this.findDefinition(ctok)) {
        if (lex != "") {
          collector(lex, lex_def);
        }

        lex = ctok;
        lex_def = this.findDefinition(ctok);
      } else if (ctok !== undefined) {
        // just a plain ol character being added to a word
        lex += ctok;
      }

      // @question any special handling needed for ctok === undefined?

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
