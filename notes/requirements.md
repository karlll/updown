## Overview

`updown` is an application that will read a markdown file and render it in the browser as a slideshow

It consists, on a high level, of three parts

- parser
- renderer
- controller

### Controller

The controller is the entry point.

- It will orchestrate the parsing, rendering and the navigation between slides
- It will read a markdown file and provide it to the parser
- It will receive the output from the parser and provide it to the renderer
- It will return the resulting HTML to the browser
- It will provide a REST interface allowing the browser to request a certain slide by number
- It will add some navigation logic to the HTML returned by the renderer, so that the user can navigate to the next and previous slide by keyboard

### Parser

- The parser reads a markdown file, that is provided as input.
- The parser will output an intermediate format representing the slides defined in the markdown file 
- The parser will use mdast library and produce an AST according to that format

### Renderer

The renderer will receive the AST from the parser and create a HTML representation


### Technology

- bun
- typescript
- mdast

tests using tools provided by bun

## Details and conventions

### Structure

- There should be a top level `div` with the id `slideshow`, containing all the separate slides
- The HTML content of each slide should be wrapped in a div
- The first div in the slideshow should have the class `first` appended to its class list
- The last div in the slideshow should have the class `last` appended to its class list
- If there is only one slide in the slideshow, only `first` should by appended its class list

### New slides

- Every `# (h1)` and `## (h2)` implies that a new slide has begun, and the heading is the first element in the new slide 
- Every `--- (hl)` implies that a new slide will begin below the element 
- A `---` followed by a `#` or `##` below should only create one new slide, not two.

### Front matter

- front matter can only exist at the top of the markdown document.
- front matter contains YAML 
- front matter should never be rendered, but parsed and retained as meta data
- the YAML values can be of either string, number or array types, where an array could contain only string and or number values. No objects or nested arrays are valid.
  - Invalid types should be ignored
- the front matter should be parsed, and provided to the top level `div` (with `id="slideshow"`) as parameters
- the parameter values are expressed as strings
  - An array is expressed as a space separated string: `["a","b","c"]` => `a b c`  
- the parameter name should be prefixed with `data-fm-`
- the parameter `class` should be handled with a separate logic, it should not have a `data-fm-` prefix, but passed as is, i.e. `class` 

#### Example

```markdown
---
foo: bar
bag: baz
zab:
  - mog
  - 1337
  - gog
class: 
 - a
 - b
 - c 
---
```

Should result in 

`<div id="slideshow" class="a b c" data-fm-foo="bar" data-fm-bag="baz" data-fm-zab="mog 1337 gog">`

### Meta-fence

- A code block with the fence `meta` should not be rendered, but parsed with the same logic as for frontmatter. The parameter prefix should be `data-meta-` and the parameters and values should be added to the element directly "above" the code block. The expection regarding "class" applies here as well

#### Example


    ## Foo
    ```meta
    foo: bar
    class:
     - f
     - g
    ```


Would result in the HTML: `<h2 class="f g" data-meta-foo="bar">Foo</h2>`

### Pluggable: rendering content using fenced codeblocks

There will be logic added to render content based on content in fenced codeblocks, defined by the fence "identifier". Examples are Mermaid and PlantUML diagrams. The solution should be general and extendable so that functionality later can be added to render new content using external means. Both Mermaid and PlantUML will be rendered using external libraries.

---

## Example 1 - Detailed example

### Example: Input Markdown

<example>
---
theme: updown-catppuccin
style: dark
class:
 - foo
 - bar
---

# Slide title 

## Slide 2

- foo
- bar 
  - baz 
  - bog

```python
print("Hello World!")
```

> block quote line 1 
> block quote line 2

## Slide 3 

Some content. This is `inline` code.
[a link](http://test.com)

### Subsection, slide 3 

1. List item 1
2. List item 2
3. List item 3

## Slide 4

This is a paragraph

| Row1 | Row2 |
|------|------|
| foo  | bar  |

</example>


### Example: Resulting HTML

```html
<div id="slideshow" data-fm-theme="updown-catppuccin" data-fm-style="dark" class="foo bar">
  <div id="slide-1" class="slide">
    <h1>Slide title</h1>
  </div>
  <div id="slide-2" class="slide">
    <h2>Slide 2</h1>
    <ul>
      <li>foo</li>
      <li>bar
        <ul>
          <li>baz</li>
          <li>bog</li>
        </ul>
      </li>
    </ul>
    <div class="fence python">
      <pre>
        print(&quot;Hello World!&quot;)
      </pre>
    </div>
    <blockquote>
      <p>block quote line 1 
      block quote line 2</p>
    </blockquote>
  </div>
  <div id="slide-3" class="slide">
    <h2>Slide 3</h2>
    <p>Some content. This is <code>inline</code> code.
    <a href="http://test.com">a link</a></p>
    <h3>Subsection, slide 3</h3>
    <ol>
      <li>List item 1</li>
      <li>List item 2</li>
      <li>List item 3</li>
    </ol>
  </div>
  <div id="slide-4" class="slide">
    <h2>Slide 4</h2>
    <p>This is a paragraph</p>
    <table>
      <thead>
        <tr>
          <th>Row1</th>
          <th>Row2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>foo</td>
          <td>bar</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

## Example 2 - Slide separation

### Example: Input Markdown

<example>

# Example

---

foo

---

bar

---

baz

---

## Bob

gog  

</example>

### Example: Resulting HTML

```html
<div id="slideshow" data-fm-theme="updown-catppuccin" data-fm-style="dark" class="foo bar">
  <div id="slide-1" class="slide">
    <h1>Example</h1>
  </div>
  <div id="slide-2" class="slide">
    <p>foo</p>
  </div>
  <div id="slide-3" class="slide">
    <p>bar</p>
  </div>
  <div id="slide-4" class="slide">
    <p>baz</p>
  </div>
  <div id="slide-5" class="slide">
    <h2>Bob</h2>
    <p>gog</p>
  </div>
</div>
```