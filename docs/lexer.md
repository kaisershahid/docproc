## Lexemes

Lexemes are split between pre-defined tokens and everything else. A **lexeme definition** is considered as:

```
{
	priority: number,
	upTo?: number,
	type?: string,
	lookead?: (content: string, lexeme: string, i: number) =>
		undefined |
		{nextIndex?: number, newLexeme?: string, newLexemeDef?: any}
}
```

### `priority`

When you define a lexeme, you always need to give it a **priority**:

```
'#' => {priority: 100} // priorities are arbitrary
```

Priorities are used to select the appropriate lexeme when they both start with the same string. For instance, if you have:

```
'#' => {priority: 100}
'##' => {priority: 101}
```

And the following document:

```markdown
###Heading
```

the lexer will emit:

- `##`
- `#`
- `Heading`

If `#` received a higher priority, however, the lexer would emit:

- `#`
- `#`
- `#`
- `Heading`

### `type`

Lexemes can have an optional type, which can describe the general class the lexeme belongs to:

```
'#' => {priority: 100, type: 'hash'}
```

### `upTo` (repetition)

Lexemes can also define a maximum repetition with **upTo**:

```
'#' => {priority: 100, upTo: 6}
```

This would collect up to 6 `#` before emitting the lexeme.

> For your own sake, don't mix `upTo` with same-prefix lexemes since they intrinsically conflict. For instance, `#` with repetition would be ignored if a higher priority `##` is defined. If `#` has a higher priority, `##` will be ignored.

### `lookahead`

Lexemes can also define a **lookahead** function (which overrides `upTo`). This gives developers a powerful and easy way to do some fancy lookahead.

If `newLexeme` is defined, this is emitted instead of `lexeme`. If `nextIndex` is defined, the pointer is moved to this position (must always move ahead). If `newLexemeDef` is defined, this is emitted instead of original definition.

Let's say your document supports a fixed set of declarations such as:

```
[@declaration1]: ...
[@another-declaration]: ...
```

While you could define `[@declaration1]` and `[@another-declaration]` as completely separate lexemes, you could also define:

```
'[@' => {priority: 1, lookahead: (content, lexeme, i) => {
	// get a substring long enough to cover whatever declarations you have
	const substr = content.substr(i, 15);
	const match = substr.match(/^(declaration1|another-declaration)/);
	if (match) {
		const newLexeme = lexeme + match[1];
		return {nextIndex: i + match[1].length, newLexeme}
	}
}}
```

## Lexer

The default lexer is a reference implementation of the behaviors described above. When you configure a lexer, you'll just be adding key-value pairs:

```
const lexer = new Lexer();
lexer.setLexeme('*', {priority: 1});
lexer.setLexeme("\n", {priority: 1});
``` 
