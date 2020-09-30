# Dinomark

Dinomark is an extension of Markdown that adds dynamic processing abilities in a Markdown-compatible way (meaning they'll be ignored when rendered through a standard processor).

To do this, it's going to exploit two key features:

1. Link references in the form `[Key]: http:// (...)` are never outputted if they're properly structured
2. Inline links in the form `[](...)` and `[][...]` are not outputted

With that in mind, let's look at the extension!

## Supported Markup

Out of the box, the following are supported:

|syntax                       |target |description
|---                          |---    |---
|`[@var]: key (jsonValue)`    |block  |defines a variable `key` with a JSON-encoded value (e.g. `1`, `true`, `[1,"2"]`, etc.)
|`[@include-vars]: filePath (key)` |block  |attempts to read variables from `filePath` and store them under `key`
|`[@include]: filePath`       |block  |dumps content of file into current block.
|`[@process]: filePath (opts)`|block  |similar to `@include`, except file will be processed before being included. `opts` (TBD) allows you to pass special instructions, such as input or output format.
|`[][var.key]`                |inline |outputs value nested under `var.key` or blank string if undefined
|`[](expression)`             |inline |(future) interprets and executes expression.

## Expanding `[@directive]`

The plugin stores an instance of `DirectivesManager` under the key `provider.dinomark.directive-manager` which allows you to map a directive/action pair to a `DirectiveHandler`. The handler in turn does what it needs to and, if generating output, returns a stringable value.