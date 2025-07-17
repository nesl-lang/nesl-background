# PBON (Piped Block JSON) Usage Guide

## Core Concept
PBON = JSON where strings with special chars use piped blocks instead of escaping.

## Syntax
```
--------------------raw<[3 random alphanumeric chars]
|[content with each line prefixed by |]
--------------------raw>[same 3 chars]
```

## Rules

1. **Line prefix**: Every line in block starts with `|`
2. **Pipe escaping**: Content pipe → double pipe (`|` → `||`)
3. **Empty lines**: Just `|` 
4. **Delimiter format**: Exactly 20 dashes + `raw<` or `raw>` + 3 chars
5. **Random IDs**: Each block gets new random [a-zA-Z0-9]{3}
6. **Comma placement**: Always on line after closing delimiter
7. **Indentation**: Delimiters can match JSON structure indentation

## When to Use Piped Blocks
- Strings with: `"` `\` newlines, tabs
- Multi-line content
- Otherwise: use standard JSON `"string"`

## Examples

**Basic:**
```pbon
{
  "path": 
--------------------raw<a7x
|C:\Users\file.txt
--------------------raw>a7x
}
```

**With pipes:**
```pbon
{
  "cmd": 
--------------------raw<9kJ
|echo "test" || exit 1
--------------------raw>9kJ
}
```

**Empty lines:**
```pbon
{
  "text": 
--------------------raw<m3Q
|Line 1
|
|Line 3 (empty above)
--------------------raw>m3Q
}
```

**Indented:**
```pbon
{
  "nested": {
    "html": 
      --------------------raw<7nH
      |<div>content</div>
      --------------------raw>7nH
  }
}
```

## Don'ts
- Don't forget `|` prefix on every line
- Don't reuse IDs
- Don't put comma on delimiter line
- Don't use different dash counts

# PBON Examples with JSON Equivalents

## Example 1: Basic Error

### PBON
```pbon
{
  "error": 
--------------------raw<k7j
|Expected format: {"id": "value"}
|Received: {"id": null}
--------------------raw>k7j
,
  "code": 400
}
```

### JSON
```json
{
  "error": "Expected format: {\"id\": \"value\"}\nReceived: {\"id\": null}",
  "code": 400
}
```

## Example 2: Content with Pipes

### PBON
```pbon
{
  "command": 
--------------------raw<x9m
|grep "error" || echo "not found"
|ps aux || pid | sort
--------------------raw>x9m
}
```

### JSON
```json
{
  "command": "grep \"error\" | echo \"not found\"\nps aux | pid | sort"
}
```

## Example 3: Indented Block

### PBON
```pbon
{
  "template": 
    --------------------raw<7nH
    |<div>
    |  <p>Hello {{name}}</p>
    |</div>
    --------------------raw>7nH
    ,
  "type": "html"
}
```

### JSON
```json
{
  "template": "<div>\n  <p>Hello {{name}}</p>\n</div>",
  "type": "html"
}
```

## Example 4: Empty Lines and Mixed Content

### PBON
```pbon
{
  "script": 
    --------------------raw<pQ2
    |#!/bin/bash
    |
    |# Empty line above
    |echo "Status: $?"
    |
    --------------------raw>pQ2
}
```

### JSON
```json
{
  "script": "#!/bin/bash\n\n# Empty line above\necho \"Status: $?\"\n"
}
```

## Example 5: Pipe at Start of Line

### PBON
```pbon
{
  "ascii": 
    --------------------raw<3Kv
    |||- This line starts with a pipe
    |||  Another pipe-prefixed line
    |Normal line
    --------------------raw>3Kv
}
```

### JSON
```json
{
  "ascii": "|- This line starts with a pipe\n|  Another pipe-prefixed line\nNormal line"
}
```

## Rules Summary
- Every line between delimiters must start with `|`
- Actual pipes in content: use `||`
- Empty lines: just `|`
- Delimiters can be indented for readability