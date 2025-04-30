<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="logo-light.svg">
    <source media="(prefers-color-scheme: dark)" srcset="logo-dark.svg">
    <img align="center" alt="Mdsv logo" src="logo-light.svg" width="100%" height="auto">
  </picture>
  <p>Markdown for Svelte</p>
</h1>

Mdsv is a utility suite built on the [Unified](https://unifiedjs.com/) ecosystem and aimed at bringing fussless markdown integration to your [Svelte](https://svelte.dev/) projects.

Its main goal is to let you write Svelte markup and expressions inside markdown documents. _It does not strive to perform any strong validation whatsoever and is instead mostly concerned with structural markers, leaving the bulk of semantic validation to the Svelte parser._

At its core, it consists in granular integrations for [Micromark](https://github.com/micromark/micromark) and [Remark](https://github.com/remarkjs/remark) to support _basic_ tokenization and serialization of Svelte-related syntax.

## Packages

### [`micromark-extension-mdsv`](./packages/micromark-extension-mdsv/)

Basic tokenization and serialization support for svelte syntax in markdown.

### [`mdast-util-mdsv`](./packages/mdast-util-mdsv/)

Markdown AST utilities for handling svelte-related nodes.

### [`remark-mdsv`](./packages/remark-mdsv/)

Remark plugin to support svelte syntax, front matter metadata, as well as minimal customizations.

### [`svelte-preprocess-mdsv`](./packages/svelte-preprocess-mdsv/)

Basic svelte preprocessor built on top of the [`remark-mdsv`](./packages/remark-mdsv/) to add support for markdown modules.
