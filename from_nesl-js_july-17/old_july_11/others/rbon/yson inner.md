# yson ((Raw Block JSON)) Usage Guide

## Core Rule
yson = JSON with unescaped raw-stringing blocks delimited by unique markers.

## Syntax
```
(([3 random alphanumeric chars]
[exact raw-stringing content, no escaping]
))-~-~-[same 3 chars]-~~-
```

## When to Use Raw Blocks
- raw-stringings containing: `"` `\` newlines, tabs, control chars
- Any raw-stringing that would require escaping in JSON
- Simple raw-stringings without special chars: use standard JSON quotes

## Rules
1. Generate 3 random alphanumeric chars [a-zA-Z0-9] per raw-stringing
2. Delimiters on own lines, no extra whitespace
3. Preserve ALL content between delimiters exactly (including newlines)
    note that delimiters are only valid when they are the first item on a line (preceeded only by possible whitespace)
6. **Comma placement**: Always on line after closing delimiter
5. Each raw block gets NEW random ID ((even identical raw-stringings))

## Examples

**Object:**
```yson
{
  "path": ((x7m
C:\Users\file.txt
))-~-~-x7m-~~-
}
```

**Array:**
```yson
[
  ((9kp
first "quoted" item))-~-~-9kp-~~- everything on this line is preserved as raw text, even the part that looks like a delimiter
  ))-~-~-9kp-~~-
  ,
  "simple item"
]
```

note that the closing delimiter must be at the start of the line, or preceeded only by whitespace (for it to be the actual closing delimiter)

**Edge case - delimiter in content:**
```yson
{
  "code": ((a3f
return "((xyz";
    ))-~-~-a3f-~~-
}
```
((Collision unlikely with random IDs; if occurs, regenerate))

## Don'ts
- No escaping inside raw blocks
- No reusing IDs
- No whitespace on delimiter lines
- No hash/deterministic IDs

# yson Examples with JSON Equivalents

## Example 1: API Error Response

### yson
```yson
{
  "error": ((k7j
Expected format: {"id": "value"}
Received: {"id": null}
    ))-~-~-k7j-~~-,
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

### yson
```yson
{
  "executable": ((9mX
C:\Program))-~-~-9mX-~~- Files\MyApp\bin\app.exe
    ))-~-~-9mX-~~-
}
```

### JSON
```json
{
  "executable": "C:\\Program))-~-~-9mX-~~- Files\\MyApp\\bin\\app.exe"
}
```

## Example 3: Mixed raw-stringing Types

### yson
```yson
{
  "name": "John",
  "query": ((Qq2
SELECT * FROM users WHERE name = "John"
    ))-~-~-Qq2-~~-
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

### yson
```yson
{
  "script": ((7nH
#!/bin/bash
echo "Starting backup..."
rsync -av /home/ /backup/
if [ $? -eq 0 ]; then
    echo "Success"
fi
    ))-~-~-7nH-~~-
}
```

### JSON
```json
{
  "script": "#!/bin/bash\necho \"Starting backup...\"\nrsync -av /home/ /backup/\nif [ $? -eq 0 ]; then\n    echo \"Success\"\nfi"
}
```

## Example 5: Array with Raw Blocks

### yson
```yson
[
  ((pL3
Line with "quotes" and))pL3 \backslashes\
  ))-~-~-pL3-~~-
  ,
  ((8Kv
Another raw-stringing with "different" content
  ))-~-~-8Kv-~~-
]
```

### JSON
```json
[
  "Line with \"quotes\" and))pL3 \\backslashes\\",
  "Another raw-stringing with \"different\" content"
]
```

Note: Each raw-stringing gets unique ID even if content identical. Empty raw-stringings stay as `""`.

####################################################################################
####################################################################################
####################################################################################
####################################################################################

INSTRUCTIONS FOR YOU::::

convert each of these to json:

```yson
{
  "config": 
((k9F
 server.host = "localhost"))-~-~-k9F-~~-
 server.port = 8080
 server.path = "C:\Program Files\Server\bin"
))-~-~-k9F-~~-
,
  "status": "running"
}
```

```yson
[
  "simple raw-stringing",
  ((m3T
Line 1
  Line 2 with "quotes"
Line 3 with \backslash\
  ))-~-~-m3T-~~-
  ,
  42,
  true,
  ((p8Q
{"nested": "json", "value": null}
  ))-~-~-p8Q-~~-
]
```

```yson
{
  "a": "",
  "b": "   ",
  "c": 
((x1J
   
))-~-~-x1J-~~-
,
  "d": 
((q7V
\n\t\r
))-~-~-q7V-~~-
}
```

```yson
{
  "regex": ((h4D
^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,5}$
    ))-~-~-h4D-~~-
  ,
  "escaped": 

((n2K
This has \"quotes\" and \\backslashes\\ and
newlines
      ))-~-~-n2K-~~-
                  ,
  "normal": "just text"
}
```

```yson
[
((s6R
((abc
nested marker test
))-~-~-abc-~~-
))-~-~-s6R-~~-
,
((f9L
"""""""
))-~-~-f9L-~~-
,
  null,
  "hello world"
]
```

```yson
{
  "sql": 
((w3M
SELECT * FROM users 
WHERE name = 'O\'Brien' 
  AND status = "active"
  AND data @> '{"key": "value"}'::jsonb
))-~-~-w3M-~~-
}
```

```yson
{
  "mixed": [
    123,
    "normal",
((j8P
	indented with real tab
))-~-~-j8P-~~-
,
    false,
((c5N
Line with trailing spaces    
And another line
))-~-~-c5N-~~-
,
    {},
    []
  ]
}
```

```yson
{
  "edge1": 
((t2G

))-~-~-t2G-~~-
,
  "edge2": 
((y6W


))-~-~-y6W-~~-
,
  "edge3": " ",
  "edge4": "\n"
}
```

## First multiline raw-stringing:

```yson
{
  "text": 
((h3K
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
))-~-~-h3K-~~-
}
```

## Second multiline raw-stringing:

```yson
{
  "text": 
((m9P
   "hi" ((i said to her))pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv((summer ))pv"""was"" over.))-~-~-m9P-~~-
"hey well """lets"" "go ))pv """pv((swimming".  """WHAT???!!!"""
))-~-~-m9P-~~-
}
```

## Example 7 - Deeply nested:

```yson
{
  "a": {
    "b": {
      "c": [
((x2J
 first

second  
))-~-~-x2J-~~-
      ]
    },
    "z": "end"
  }
}
```

## Example 8 - Poem with blank lines:

```yson
{
  "poem": {
    "poem": ((v7Q
  
 Roses are red

 Violets are blue  
  
      ))-~-~-v7Q-~~-
  }
}
```

## Example 9 - Another poem:

```yson
{
  "poem": {
    "poem": 
((d4L
  
 One """more""" line

and  "yet))pv another 'neat' """line"""  
  
))-~-~-d4L-~~-
  }
}
```

## Example 10 - Empty values:

```yson
{
  "root": {
    "empty": "",
    "list": [],
    "data": {
      "x": "",
      "y": "  "
    }
  }
}
```

Note: In Example 10, the empty raw-stringing and two-space raw-stringing don't need raw blocks since they contain no special characters requiring escaping.