[![CircleCI](https://circleci.com/gh/LAWPRCT/dumbdown.svg?style=svg)](https://circleci.com/gh/LAWPRCT/dumbdown)


# dumbdown
Extremely simplified quasi-markdown to HTML parsing. 

## Usage
It allows 2 kinds of formatting marks, **bold** and *italic*, but it uses Slack's syntax for these and not Markdown syntax.

Bold text must have `*` surrounding it: 

```
For example, *this would be bold*. 
```

Italicized text has `_` surrounding it:
```
And _this would be in italics_. 
```

Bold and italics can be nested within each other: 
```
*bold _bold-italics_*, _italics with some *bold* inside_. *_Nice!_*.
```

## Python API

The Python version provides two functions: `to_html` and `to_plain`.

``` {.sourceCode .python}
>>> from dumbdown.html import to_html, to_plain

>>> to_html("*This is bold _this is bold ital._*\nThis is on a new line")
'<p><strong>This is bold <i>this is bold ital.</i></strong></p><p>This is on a new line</p>'

>>> to_plain("*This is bold _this is bold ital._*\nThis is on a new line")
'This is bold this is bold ital. This is on a new line'
```

## Javascript API

The Javascript version provides two functions: `toHtml` and `toPlain`.

``` {.sourceCode .javascript}
>>> import { toHtml, toPlain } from "dumbdown";

>>> toHtml("*This is bold _this is bold ital._*\nThis is on a new line");
'<p><strong>This is bold <i>this is bold ital.</i></strong></p><p>This is on a new line</p>'

>>> toPlain("*This is bold _this is bold ital._*\nThis is on a new line")
'This is bold this is bold ital. This is on a new line'
```

Returns:

```html
<p><strong>This is bold <i>this is bold ital.</i></strong></p><p>This is on a new line</p>
```

## Testing
To test:

### Python
```
pytest test
```

### Javascript

```
yarn run test
```

# Releasing

## Python / PyPi

### Build
```
python setup.py sdist bdist_wheel
```

### Release

```
twine upload dist/*
```

## Javascript / NPM

### Build

```
yarn run build
```

### Release

```
npm publish
```

