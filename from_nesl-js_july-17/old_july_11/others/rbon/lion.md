# lion (Raw Block JSON) Usage Guide

## Core Rule
lion = JSON with unescaped raw-stringing blocks delimited by unique markers.

## Syntax
```
--------------------raw-string<[3 random alphanumeric chars]
[exact raw-stringing content, no escaping]
--------------------raw-string>[same 3 chars]
```

## When to Use Raw Blocks
- raw-stringings containing: `"` `\` newlines, tabs, control chars
- Any raw-stringing that would require escaping in JSON
- Simple raw-stringings without special chars: use standard JSON quotes

## Rules
1. Generate 3 random alphanumeric chars [a-zA-Z0-9] per raw-stringing
2. Delimiters on own lines, no extra whitespace
3. Preserve ALL content between delimiters exactly (including newlines)
6. **Comma placement**: Always on line after closing delimiter
5. Each raw block gets NEW random ID (even identical raw-stringings)

## Examples

**Object:**
```lion
{
  "path": 
--------------------raw-string<x7m
C:\Users\file.txt
--------------------raw-string>x7m
}
```

**Array:**
```lion
[
--------------------raw-string<9kp
first "quoted" item
--------------------raw-string>9kp
,
  "simple item"
]
```

**Edge case - delimiter in content:**
```lion
{
  "code": 
--------------------raw-string<a3f
return "--------------------raw-string<xyz";
--------------------raw-string>a3f
}
```
(Collision unlikely with random IDs; if occurs, regenerate)

## Don'ts
- No escaping inside raw blocks
- No reusing IDs
- No whitespace on delimiter lines
- No hash/deterministic IDs

# lion Examples with JSON Equivalents

## Example 1: API Error Response

### lion
```lion
{
  "error": 
--------------------raw-string<k7j
Expected format: {"id": "value"}
Received: {"id": null}
--------------------raw-string>k7j
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

### lion
```lion
{
  "executable": 
--------------------raw-string<9mX
C:\Program Files\MyApp\bin\app.exe
--------------------raw-string>9mX
}
```

### JSON
```json
{
  "executable": "C:\\Program Files\\MyApp\\bin\\app.exe"
}
```

## Example 3: Mixed raw-stringing Types

### lion
```lion
{
  "name": "John",
  "query": 
--------------------raw-string<Qq2
SELECT * FROM users WHERE name = "John"
--------------------raw-string>Qq2
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

### lion
```lion
{
  "script": 
--------------------raw-string<7nH
#!/bin/bash
echo "Starting backup..."
rsync -av /home/ /backup/
if [ $? -eq 0 ]; then
    echo "Success"
fi
--------------------raw-string>7nH
}
```

### JSON
```json
{
  "script": "#!/bin/bash\necho \"Starting backup...\"\nrsync -av /home/ /backup/\nif [ $? -eq 0 ]; then\n    echo \"Success\"\nfi"
}
```

## Example 5: Array with Raw Blocks

### lion
```lion
[
--------------------raw-string<pL3
Line with "quotes" and \backslashes\
--------------------raw-string>pL3
,
--------------------raw-string<8Kv
Another raw-stringing with "different" content
--------------------raw-string>8Kv
]
```

### JSON
```json
[
  "Line with \"quotes\" and \\backslashes\\",
  "Another raw-stringing with \"different\" content"
]
```

Note: Each raw-stringing gets unique ID even if content identical. Empty raw-stringings stay as `""`.

####################################################################################
####################################################################################
####################################################################################
####################################################################################

INraw-stringUCTIONS FOR YOU::::

convert each of these to json:

```lion
{
  "config": 
--------------------raw-string<k9F
 server.host = "localhost"
 server.port = 8080
 server.path = "C:\Program Files\Server\bin"
--------------------raw-string>k9F
,
  "status": "running"
}
```

```lion
[
  "simple raw-stringing",
--------------------raw-string<m3T
Line 1
  Line 2 with "quotes"
Line 3 with \backslash\
--------------------raw-string>m3T
,
  42,
  true,
--------------------raw-string<p8Q
{"nested": "json", "value": null}
--------------------raw-string>p8Q
]
```

```lion
{
  "a": "",
  "b": "   ",
  "c": 
--------------------raw-string<x1J
   
--------------------raw-string>x1J
,
  "d": 
--------------------raw-string<q7V
\n\t\r
--------------------raw-string>q7V
}
```

```lion
{
  "regex": 
--------------------raw-string<h4D
^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,5}$
--------------------raw-string>h4D
,
  "escaped": 
--------------------raw-string<n2K
This has \"quotes\" and \\backslashes\\ and
newlines
--------------------raw-string>n2K
,
  "normal": "just text"
}
```

```lion
[
--------------------raw-string<s6R
--------------------raw-string<abc
nested marker test
--------------------raw-string>abc
--------------------raw-string>s6R
,
--------------------raw-string<f9L
"""""""
--------------------raw-string>f9L
,
  null,
  "hello world"
]
```

```lion
{
  "sql": 
--------------------raw-string<w3M
SELECT * FROM users 
WHERE name = 'O\'Brien' 
  AND status = "active"
  AND data @> '{"key": "value"}'::jsonb
--------------------raw-string>w3M
}
```

```lion
{
  "mixed": [
    123,
    "normal",
--------------------raw-string<j8P
	indented with real tab
--------------------raw-string>j8P
,
    false,
--------------------raw-string<c5N
Line with trailing spaces    
And another line
--------------------raw-string>c5N
,
    {},
    []
  ]
}
```

```lion
{
  "edge1": 
--------------------raw-string<t2G

--------------------raw-string>t2G
,
  "edge2": 
--------------------raw-string<y6W


--------------------raw-string>y6W
,
  "edge3": " ",
  "edge4": "\n"
}
```

## First multiline raw-stringing:

```lion
{
  "text": 
--------------------raw-string<h3K
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
--------------------raw-string>h3K
}
```

## Second multiline raw-stringing:

```lion
{
  "text": 
--------------------raw-string<m9P
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv(summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
--------------------raw-string>m9P
}
```

## Example 7 - Deeply nested:

```lion
{
  "a": {
    "b": {
      "c": [
--------------------raw-string<x2J
 first

second  
--------------------raw-string>x2J
      ]
    },
    "z": "end"
  }
}
```

## Example 8 - Poem with blank lines:

```lion
{
  "poem": {
    "poem": 
--------------------raw-string<v7Q
  
 Roses are red

 Violets are blue  
  
--------------------raw-string>v7Q
  }
}
```

## Example 9 - Another poem:

```lion
{
  "poem": {
    "poem": 
--------------------raw-string<d4L
  
 One """more""" line

and  "yet)pv another 'neat' """line"""  
  
--------------------raw-string>d4L
  }
}
```

## Example 10 - Empty values:

```lion
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