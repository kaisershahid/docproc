# For 0.9.0 (initial public release)

## Todos

- markdown: make sure there's proper HTML escaping where it needs to be
- documentation: fill out more
- handlers: support scopes (hints about what area of the doc the processor is in so that only appropriate handlers get invoked)

## Done

- markdown: implement html block handler
- dinomark: implement `${var.interpolation}` inline handler
- dinomark: implement `[@var] key (jsonValue)` block handler
- dinomark: implement `[@var-merge] rootKey (jsonMap)` block handler
- dinomark: implement `[@include] filePath (description)` block handler
- processor: data registry that allows handlers to emit/consume metadata

# For 1.0.0

## Todos

- processor: allow blocks to modify block chain (lol) to allow for things like capturing output from specific sections