# Dinomark

Dinomark is an extension of Markdown that adds dynamic processing abilities in a Markdown-compatible way (meaning they'll be ignored when rendered through a standard processor).

To do this, it's going to exploit two key features:

1. Link references in the form `[Key]: http:// (...)` are never outputted if they're properly structured
2. Inline links in the form `[](...)` and `[][...]` are not outputted

With that in mind, let's look at the extension!

## Supported Markup

Out of the box, the following are supported:

### Block

|syntax                       |target |description
|---                          |---    |---
|`[@var]: key (jsonValue)`    |block  |defines a variable `key` with a JSON-encoded value (e.g. `1`, `true`, `[1,"2"]`, etc.)
|`[@include-vars]: filePath (key)` |block  |attempts to read variables from `filePath` and store them under `key`
|`[@include]: filePath`       |block  |dumps content of file into current block.
|`[@process]: filePath (opts)`|block  |similar to `@include`, except file will be processed before being included. `opts` (TBD) allows you to pass special instructions, such as input or output format.
|`[@execute]: filePath (func)`|block  |runs a script! see below
|`[@capture]: varName`        |block  |starts capture of output for all blocks after this, stored in var `varName`
|`[@end-capture]:`            |block  |ends capturing of blocks 

### Inline

|syntax                       |target |description
|---                          |---    |---
|`[][var.key]`                |inline |outputs value nested under `var.key` or blank string if undefined
|`[](expression)`             |inline |(future) interprets and executes expression.

## `[@execute]` flow

The file provided by `filePath` is expected to be a JavaScript file. `func`, if specified, gives the entrypoint and/or additional parameters as JSON-encoded values:

- `?{"param1":1}` (defaults to `execute` function with `{param1:1}` as parameters)
- `anotherFunc` (parameters defaults to `{}`)
- `anotherFunc?{"param1":1}`

The **entrypoint** should have the following signature:

```
(ctx: DocProcContext, def: DirectiveDefinition, {
    parameters: any,
    makeProcessor: (ctxOverride) => DocProcessor
}): any => {}
```

`makeProcessor()` returns an instance of `DocProcessor` with potential overrides to the context. Two things to note:

1. `DataRegistry` is always replaced without an explicit override
2. `vars` is always replaced without an explicit override

This gives the script full access to context settings. `null` and `undefined` returned values are not outputted.

## Expanding `[@directive]`

The plugin stores an instance of `DirectivesManager` under the key `provider.dinomark.directive-manager` which allows you to map a directive/action pair to a `DirectiveHandler`. The handler in turn does what it needs to and, if generating output, returns a stringable value.