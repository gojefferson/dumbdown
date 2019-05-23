[![CircleCI](https://circleci.com/gh/gojefferson/dumbdown.svg?style=svg)](https://circleci.com/gh/gojefferson/dumbdown)


# dumbdown
Extremely simplified quasi-markdown to HTML parsing, available in both Javascript and Python.

## Installation

To install the python package:

```
pip install dumbdown
```

To install the npm package:

```
npm install dumbdown
```

# Demo

To see the demo: clone this repo, install node modules from `package.json` and open `demo.html` in your favorite browser. Try typing some text with * and _ characters.


## Usage
It allows 3 kinds of formatting marks, **bold**, *italic*, and > blockquotes but it uses Slack's syntax for these and not Markdown syntax.

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

A blockquote is a line starting with `>`:
```
> this is a blockquote
> woo
```

## Python API

The Python version provides two functions: `to_html` and `to_plain`.

```py
>>> from dumbdown import to_html, to_plain

>>> to_html("*This is bold _this is bold ital._*\nThis is on a new line")
'<p><strong>This is bold <i>this is bold ital.</i></strong></p><p>This is on a new line</p>'

>>> to_plain("*This is bold _this is bold ital._*\nThis is on a new line")
'This is bold this is bold ital. This is on a new line'
```

## Javascript API

The Javascript version provides two functions: `toHtml` and `toPlain`.

```js
>>> import { toHtml, toPlain } from "dumbdown";

>>> toHtml("*This is bold _this is bold ital._*\nThis is on a new line");
'<p><strong>This is bold <i>this is bold ital.</i></strong></p><p>This is on a new line</p>'

>>> toPlain("*This is bold _this is bold ital._*\nThis is on a new line")
'This is bold this is bold ital. This is on a new line'
```

## Testing
To test:

### Python
```
pytest
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

