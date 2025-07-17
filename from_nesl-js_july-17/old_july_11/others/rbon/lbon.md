# lbon (Raw Block JSON) Usage Guide

## Core Rule
lbon = JSON with unescaped string blocks delimited by unique markers.

## Syntax
```
____________________raw<[3 random alphanumeric chars]
[exact string content, no escaping]
____________________raw>[same 3 chars]
```

## When to Use Raw Blocks
- Strings containing: `"` `\` newlines, tabs, control chars
- Any string that would require escaping in JSON
- Simple strings without special chars: use standard JSON quotes

## Rules
1. Generate 3 random alphanumeric chars [a-zA-Z0-9] per string
2. Delimiters on own lines, no extra whitespace
3. Preserve ALL content between delimiters exactly (including newlines)
4. Comma after END delimiter if needed: `____________________raw>abc,`
5. Each raw block gets NEW random ID (even identical strings)

## Examples

**Object:**
```lbon
{
  "path": 
____________________raw<x7m
C:\Users\file.txt
____________________raw>x7m
}
```

**Array:**
```lbon
[
____________________raw<9kp
first "quoted" item
____________________raw>9kp
,
  "simple item"
]
```

**Edge case - delimiter in content:**
```lbon
{
  "code": 
____________________raw<a3f
return "____________________raw<xyz";
____________________raw>a3f
}
```
(Collision unlikely with random IDs; if occurs, regenerate)

## Don'ts
- No escaping inside raw blocks
- No reusing IDs
- No whitespace on delimiter lines
- No hash/deterministic IDs

# lbon Examples with JSON Equivalents

## Example 1: API Error Response

### lbon
```lbon
{
  "error": 
____________________raw<k7j
Expected format: {"id": "value"}
Received: {"id": null}
____________________raw>k7j
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

## Example 2: Windows Path

### lbon
```lbon
{
  "executable": 
____________________raw<9mX
C:\Program Files\MyApp\bin\app.exe
____________________raw>9mX
}
```

### JSON
```json
{
  "executable": "C:\\Program Files\\MyApp\\bin\\app.exe"
}
```

## Example 3: Mixed String Types

### lbon
```lbon
{
  "name": "John",
  "query": 
____________________raw<Qq2
SELECT * FROM users WHERE name = "John"
____________________raw>Qq2
,
  "status": "active"
}
```

### JSON
```json
{
  "name": "John",
  "query": "SELECT * FROM users WHERE name = \"John\"",
  "status": "active"
}
```

## Example 4: Multiline Code

### lbon
```lbon
{
  "script": 
____________________raw<7nH
#!/bin/bash
echo "Starting backup..."
rsync -av /home/ /backup/
if [ $? -eq 0 ]; then
    echo "Success"
fi
____________________raw>7nH
}
```

### JSON
```json
{
  "script": "#!/bin/bash\necho \"Starting backup...\"\nrsync -av /home/ /backup/\nif [ $? -eq 0 ]; then\n    echo \"Success\"\nfi"
}
```

## Example 5: Array with Raw Blocks

### lbon
```lbon
[
____________________raw<pL3
Line with "quotes" and \backslashes\
____________________raw>pL3
,
____________________raw<8Kv
Another string with "different" content
____________________raw>8Kv
]
```

### JSON
```json
[
  "Line with \"quotes\" and \\backslashes\\",
  "Another string with \"different\" content"
]
```

Note: Each string gets unique ID even if content identical. Empty strings stay as `""`.