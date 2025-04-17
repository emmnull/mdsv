# Micromark extension for svelte in markdown

Support parsing and tokenizing svelte-related syntaxes in markdown content.

## Token types

- Svelte Block: `{#block ...}...{/block}`
- Svelte Branch: `{:branch ...}`
- Svelte Tag: `{@tag ...}`
- Svelte Text Expression: `{expression}`
- Svelte Element: `<element .../>`, `<element ...>...</element>`
