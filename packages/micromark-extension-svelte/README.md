# Micromark extension for svelte in markdown

Support parsing and tokenizing svelte-related syntaxes in markdown content.

## Tokens

### Svelte Expression

`{...}`

### Svelte Tag

`{@...}`

### Svelte Block

`{#...}`, `{:...}`, `{/...}`

### Svelte Element

`<element />`, `<foo.bar />`, `<FooBar/>`, `<foo:bar>`

#### Flow vs. text heuristics
