# Inline Markup Handling

Inline markup is any markup that surrounds text, like `**bold**` or `*beautiful*`. Usually, you try to keep it simple like that. But it gets more complex with a link, like `[Link *Text*](http://url)`, which defines a nested structure.

To support this, the inline handler uses a stack-based approach to properly nest the text and apply the appropriate handling.

For instance, parsing `**hello _there_**` would look like this:

|lex |handler state
|--- |---
|-   |**handler:parent**
|`**`|&raquo; **handler:bold** found and accepting lexemes
|`hello `|&raquo; continues accepting
|`_` |&raquo;&raquo; **handler:italic** found and accepting lexemes
|`there`|&raquo;&raquo; continues accepting
|`_` |&raquo;&raquo; pop
|`**`|&raquo; pop

Parent has a reference to its children, so it can join them, and then each child would join their children, etc., to produce the output.

## Types

`enum InlineAfterPushAction`

- `NEST`: handler will start accepting lexemes
- `CONTINUE`: handler will continue accepting lexemes
- `POP`: handler will stop accepting lexemes

`InlineHandlerInterface`

- 

`InlineStateBuffer`

- `push(lexeme:string): ACTION`
- `stack[]: InlineHandler[] = [StringBuilderHandler.makeInstance()]`
    - `StringBu` 



Inline markup should only apply to text that doesn't define some internal structure (e.g. in `|table|definition|`, ignore pipes for inline formatting)