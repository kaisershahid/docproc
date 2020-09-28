# Dinomark

Dinomark is an extension of Markdown that adds dynamic processing abilities in a Markdown-compatible way (meaning they'll be ignored when rendering). To do this, it's going to exploit two key features:

1. Link references in the form `[Key]: http:// (...)` are not outputted
2. Inline links in the form `[](...)` are not outputted

With that in mind, let's look at the extension!

## Supported Markup

|syntax                       |target |description
|---                          |---    |---
|`[@var]: key (jsonValue)`    |block  |defines a variable `key` with a JSON-encoded value (e.g. `1`, `true`, `[1,"2"]`, etc.)
|`[@include-vars]: filePath (key)` |block  |attempts to read variables from `filePath` and store them under `key`
|`[@include]: filePath`       |block  |dumps content of file into current block.
|`[@process]: filePath`       |block  |similar to `@include`, except file will be processed before being dumped
|`[]($key)`                   |inline |outputs value in `$key` or blank strink if undefined.