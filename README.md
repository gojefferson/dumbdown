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
```
pytest tests.py
```

## Demo

To generate a sample DOCX file:
```
python docx-template.py
```

