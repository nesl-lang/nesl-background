####################################################################################
####################################################################################
####################################################################################
####################################################################################

INSTRUCTIONS FOR YOU::::

convert each of these to json:

```json
{
  "config": 
____________________raw<k9F
 server.host = "localhost"
 server.port = 8080
 server.path = "C:\Program Files\Server\bin"
____________________raw>k9F
,
  "status": "running"
}
```

```json
[
  "simple string",
____________________raw<m3T
Line 1
  Line 2 with "quotes"
Line 3 with \backslash\
____________________raw>m3T
,
  42,
  true,
____________________raw<p8Q
{"nested": "json", "value": null}
____________________raw>p8Q
]
```

```json
{
  "a": "",
  "b": "   ",
  "c": 
____________________raw<x1J
   
____________________raw>x1J
,
  "d": 
____________________raw<q7V
\n\t\r
____________________raw>q7V
}
```

```json
{
  "regex": 
____________________raw<h4D
^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,5}$
____________________raw>h4D
,
  "escaped": 
____________________raw<n2K
This has \"quotes\" and \\backslashes\\ and
newlines
____________________raw>n2K
,
  "normal": "just text"
}
```

```json
[
____________________raw<s6R
____________________raw<abc
nested marker test
____________________raw>abc
____________________raw>s6R
,
____________________raw<f9L
"""""""
____________________raw>f9L
,
  null,
  "hello world"
]
```

```json
{
  "sql": 
____________________raw<w3M
SELECT * FROM users 
WHERE name = 'O\'Brien' 
  AND status = "active"
  AND data @> '{"key": "value"}'::jsonb
____________________raw>w3M
}
```

```json
{
  "mixed": [
    123,
    "normal",
____________________raw<j8P
	indented with real tab
____________________raw>j8P
,
    false,
____________________raw<c5N
Line with trailing spaces    
And another line
____________________raw>c5N
,
    {},
    []
  ]
}
```

```json
{
  "edge1": 
____________________raw<t2G

____________________raw>t2G
,
  "edge2": 
____________________raw<y6W


____________________raw>y6W
,
  "edge3": " ",
  "edge4": "\n"
}
```

## First multiline string:

```json
{
  "text": 
____________________raw<h3K
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
____________________raw>h3K
}
```

## Second multiline string:

```json
{
  "text": 
____________________raw<m9P
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv(summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
____________________raw>m9P
}
```

## Example 7 - Deeply nested:

```json
{
  "a": {
    "b": {
      "c": [
____________________raw<x2J
 first

second  
____________________raw>x2J
      ]
    },
    "z": "end"
  }
}
```

## Example 8 - Poem with blank lines:

```json
{
  "poem": {
    "poem": 
____________________raw<v7Q
  
 Roses are red

 Violets are blue  
  
____________________raw>v7Q
  }
}
```

## Example 9 - Another poem:

```json
{
  "poem": {
    "poem": 
____________________raw<d4L
  
 One """more""" line

and  "yet)pv another 'neat' """line"""  
  
____________________raw>d4L
  }
}
```

## Example 10 - Empty values:

```json
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

Note: In Example 10, the empty string and two-space string don't need raw blocks since they contain no special characters requiring escaping.