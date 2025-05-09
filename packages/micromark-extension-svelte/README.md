<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../../logo-light.svg">
    <source media="(prefers-color-scheme: dark)" srcset="../../logo-dark.svg">
    <img align="center" alt="Mdsv logo" src="../../logo-light.svg" width="100%" height="auto">
  </picture>
  <p>Micromark extension for Svelte</p>
</h1>

Support parsing and tokenizing Svelte-related syntaxes in markdown content.

## Svelte Expression

`{...}`

## Svelte Tag

`{@...}`

## Svelte Block

`{#...}`, `{:...}`, `{/...}`

> [!NOTE]
> Indented code syntax is disabled by this extension, so you can safely indent block content as you would in a normal svelte file.

## Svelte Element

`<element />`, `<foo.bar />`, `<FooBar/>`, `<foo:bar>`

With components, the heuristics around how markup should contain flow or text content and the distinction regarding if an element should be a wrapper or be wrapped differs from that of normal html elements. Since we can't simply look up known block- or text-level html element names and don't want to rely on declarative APIs (such as adding a property to components or a flag around its tag), we instead lend the desired structural meaning to **adjacent lines** and **blank lines** between tags in a way that lets user control more granularly the parser's behavior.

> [!NOTE]
> Indented code syntax is disabled by this extension, so you can safely indent element content as you would in a normal svelte file.

### Svelte Flow

```md
<Foo {...props} use:baz class="a {b}" data-c={c}>
**Hi mom**
</Foo>

<Bar {...props} use:baz class="a {b}" data-c={c}>

**Hi dad**

</Bar>
```

...should be processed into:

```svelte
<Foo {...props} use:baz class="a {b}" data-c={c}>
<strong>Hi mom</strong>
</Foo>

<Bar {...props} use:baz class="a {b}" data-c={c}>
<p><strong>Hi mom</strong></p>
</Bar>
```

### Svelte Text

```md
<Foo {...props} use:baz class="a {b}" data-c={c}>**Hi mom**</Foo>
```

...should be processed into:

```svelte
<p><Foo {...props} use:baz class="a {b}" data-c={c}>
<strong>Hi mom</strong>
</Foo></p>
```
