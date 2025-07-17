# RBON (Raw Block JSON) Usage Guide

## Core Rule
RBON = JSON with unescaped string blocks delimited by unique markers.

## Syntax
```
<<<RAW-START-[3 random alphanumeric chars]
[exact string content, no escaping]
<<<RAW-END-[same 3 chars]
```

## When to Use Raw Blocks
- Strings containing: `"` `\` newlines, tabs, control chars
- Any string that would require escaping in JSON
- Simple strings without special chars: use standard JSON quotes

## Rules
1. Generate 3 random alphanumeric chars [a-zA-Z0-9] per string
2. Delimiters on own lines, no extra whitespace
3. Preserve ALL content between delimiters exactly (including newlines)
4. Comma after END delimiter if needed: `<<<RAW-END-abc,`
5. Each raw block gets NEW random ID (even identical strings)

## Examples

**Object:**
```rbon
{
  "path": 
<<<RAW-START-x7m
C:\Users\file.txt
<<<RAW-END-x7m
}
```

**Array:**
```rbon
[
  <<<RAW-START-9kp
first "quoted" item
<<<RAW-END-9kp
,
  "simple item"
]
```

**Edge case - delimiter in content:**
```rbon
{
  "code": 
<<<RAW-START-a3f
return "<<<RAW-START-xyz";
<<<RAW-END-a3f
}
```
(Collision unlikely with random IDs; if occurs, regenerate)

## Don'ts
- No escaping inside raw blocks
- No reusing IDs
- No whitespace on delimiter lines
- No hash/deterministic IDs

# RBON Examples with JSON Equivalents

## Example 1: API Error Response

### RBON
```rbon
{
  "error": 
<<<RAW-START-k7j
Expected format: {"id": "value"}
Received: {"id": null}
<<<RAW-END-k7j
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

### RBON
```rbon
{
  "executable": 
<<<RAW-START-9mX
C:\Program Files\MyApp\bin\app.exe
<<<RAW-END-9mX
}
```

### JSON
```json
{
  "executable": "C:\\Program Files\\MyApp\\bin\\app.exe"
}
```

## Example 3: Mixed String Types

### RBON
```rbon
{
  "name": "John",
  "query": 
<<<RAW-START-Qq2
SELECT * FROM users WHERE name = "John"
<<<RAW-END-Qq2
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

### RBON
```rbon
{
  "script": 
<<<RAW-START-7nH
#!/bin/bash
echo "Starting backup..."
rsync -av /home/ /backup/
if [ $? -eq 0 ]; then
    echo "Success"
fi
<<<RAW-END-7nH
}
```

### JSON
```json
{
  "script": "#!/bin/bash\necho \"Starting backup...\"\nrsync -av /home/ /backup/\nif [ $? -eq 0 ]; then\n    echo \"Success\"\nfi"
}
```

## Example 5: Array with Raw Blocks

### RBON
```rbon
[
  <<<RAW-START-pL3
Line with "quotes" and \backslashes\
<<<RAW-END-pL3
,
  <<<RAW-START-8Kv
Another string with "different" content
<<<RAW-END-8Kv
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