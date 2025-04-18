<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="logo-light.svg">
    <source media="(prefers-color-scheme: dark)" srcset="logo-dark.svg">
    <img align="center" alt="Mdsv logo" src="logo-light.svg" width="100%" height="auto">
  </picture>
  <p>Markdown for Svelte</p>
</h1>

*Mdsv* is a utility suite built on the [unified](https://unifiedjs.com/) ecosystem and aimed at bringing fussless markdown integration to your Svelte projects.

At it core, it consists in granular integrations for Micromark and Remark that support *basic* tokenization and serialization of Svelte-related syntax within markdown. By basic, we mean that it does not strive to perform any strong validation whatsoever and is instead mostly concerned with structural markers, leaving the bulk of semantic validation to the Svelte parser.
