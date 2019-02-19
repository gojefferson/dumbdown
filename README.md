# dumbdown
Extremely simplified markdown parsing and HTML + docx construction. 

## Usage
It allows 2 kinds of formatting marks, **bold** and *italic*, but it uses Slack's syntax for these and not Markdown syntax.

Bold text must have an `*` surrounding it: 

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


## Testing
To test:

### Python
```
pytest tests
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

