<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../../logo-light.svg">
    <source media="(prefers-color-scheme: dark)" srcset="../../logo-dark.svg">
    <img align="center" alt="Mdsv logo" src="../../logo-light.svg" width="100%" height="auto">
  </picture>
  <p>Micromark extension for Svelte</p>
</h1>

Support parsing and tokenizing Svelte-related syntaxes in markdown content.

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
