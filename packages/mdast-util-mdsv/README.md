<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../../logo-light.svg">
    <source media="(prefers-color-scheme: dark)" srcset="../../logo-dark.svg">
    <img align="center" alt="Mdsv logo" src="../../logo-light.svg" width="100%" height="auto">
  </picture>
  <p><code>mdast-util-mdsv</code></p>
</h1>

Handle svelte tokens as nodes inside markdown abstract syntax tree (MDAST).

> [!NOTE]
> Most sub-utils herein work by injecting a `<script module>` with data defined under a customizable key.
> If a `<script module>` element is already found in the markdown, contents will be coalesced.

## Metadata

Parse front matter into Svelte `module` metadata.

## Custom component

Replace parsing output elements with custom components.

## Table of contents

Extract table of contents data from headings and expose in `<script module>`
