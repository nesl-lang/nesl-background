# SSON (String-Safe Object Notation) Specification

## 1. Overview

SSON is a data interchange format identical to JSON except for string representation. In SSON, strings cannot contain escape sequences and must be represented using raw string delimiters when they contain special characters.

## 2. String Representation

### 2.1 Simple Strings
Strings containing only alphanumeric characters, spaces, and basic punctuation (excluding quotes) may use standard JSON double-quote syntax:
```
"simple string"
```

### 2.2 Raw Strings
Any string containing:
- Double quotes (")
- Backslashes (\)
- Control characters (newlines, tabs, etc.)
- Any character that would require escaping in JSON

Must use raw string syntax:
```
RAW_STRING_SSON_START
<string content exactly as-is>
RAW_STRING_SSON_END
```

### 2.3 Raw String Rules

1. **Delimiter lines**: The delimiter lines must appear on their own lines with no leading/trailing whitespace
2. **Content preservation**: All content between delimiters is preserved exactly, including newlines and whitespace
3. **No escaping**: No escape sequences are recognized within raw strings
4. **Delimiter collision**: If the string content contains the literal text "RAW_STRING_SSON_START" or "RAW_STRING_SSON_END", use the alternate delimiters:
   ```
   RAW_STRING_SSON_START_2
   content containing RAW_STRING_SSON_START
   RAW_STRING_SSON_END_2
   ```
   Continue incrementing (_3, _4, etc.) until no collision exists.

## 3. Structural Rules

### 3.1 Comma Placement
When a raw string is used as a value, the comma (if needed) appears immediately after the END delimiter on the same line:
```
"key": 
RAW_STRING_SSON_START
value
RAW_STRING_SSON_END
,
```

### 3.2 Arrays
Raw strings in arrays follow the same pattern:
```
[
  RAW_STRING_SSON_START
  first element
  RAW_STRING_SSON_END
  ,
  RAW_STRING_SSON_START
  second element
  RAW_STRING_SSON_END
]
```

### 3.3 Nesting
All JSON nesting rules apply. Raw strings can appear at any level.

## 4. Whitespace Handling

1. **Structural whitespace**: Follows JSON rules (ignored around structural elements)
2. **Raw string whitespace**: 
   - Content between delimiters preserves all whitespace exactly
   - No whitespace allowed on delimiter lines (must be exactly "RAW_STRING_SSON_START" or "RAW_STRING_SSON_END")
   - The newline immediately following START delimiter is part of the string
   - The newline immediately preceding END delimiter is part of the string

## 5. Parsing Algorithm

```
1. Parse as JSON until encountering:
   - A colon followed by whitespace and newline, then "RAW_STRING_SSON_START"
   - An array element position with "RAW_STRING_SSON_START"

2. Upon encountering RAW_STRING_SSON_START:
   a. Consume the newline after START delimiter
   b. Read all content until finding "RAW_STRING_SSON_END" at start of line
   c. The captured content (including final newline) is the string value
   d. Resume JSON parsing after the END delimiter line

3. Check for delimiter collision during parsing and use appropriate numbered variants
```

## 6. Generation Algorithm

```
1. For each string value:
   a. If contains only [A-Za-z0-9 ,.:;!?'-] and no quotes: use JSON syntax
   b. Otherwise: use raw string syntax
   
2. When using raw string:
   a. Scan content for delimiter collision
   b. Use RAW_STRING_SSON_START_N/END_N where N is first non-colliding number
   c. Output newline after START, content as-is, newline before END
```

## 7. Edge Cases

1. **Empty strings**: Use JSON syntax `""`
2. **Strings that are just whitespace**: Use raw string syntax to preserve exactly
3. **Null values**: Remain `null` (not strings)
4. **Numbers/booleans**: Follow JSON rules exactly

## 8. Invalid SSON

The following constitute invalid SSON:
- Escape sequences anywhere
- Delimiter text with leading/trailing whitespace
- Mismatched delimiter numbers (START_2 with END_3)
- Unclosed raw strings
- Raw string delimiters in JSON string context


# SSON vs JSON Examples

## Example 1: Quote Handling

### SSON
```sson
{
  "error": 
RAW_STRING_SSON_START
Expected "value" but got "null"
RAW_STRING_SSON_END
}
```

### JSON
```json
{
  "error": "Expected \"value\" but got \"null\""
}
```

## Example 2: Path with Backslashes

### SSON
```sson
{
  "path": 
RAW_STRING_SSON_START
C:\Users\Admin\Documents\file.txt
RAW_STRING_SSON_END
}
```

### JSON
```json
{
  "path": "C:\\Users\\Admin\\Documents\\file.txt"
}
```

## Example 3: Multiline Log Entry

### SSON
```sson
{
  "log": 
RAW_STRING_SSON_START
Error at line 42:
	Invalid token "}"
	Expected: identifier
RAW_STRING_SSON_END
}
```

### JSON
```json
{
  "log": "Error at line 42:\n\tInvalid token \"}\"\n\tExpected: identifier"
}
```

## Example 4: Delimiter Collision

### SSON
```sson
{
  "code": 
RAW_STRING_SSON_START_2
if (format == "SSON") {
  return "RAW_STRING_SSON_START\n" + content + "\nRAW_STRING_SSON_END";
}
RAW_STRING_SSON_END_2
}
```

### JSON
```json
{
  "code": "if (format == \"SSON\") {\n  return \"RAW_STRING_SSON_START\\n\" + content + \"\\nRAW_STRING_SSON_END\";\n}"
}
```

## Example 5: Mixed String Types

### SSON
```sson
{
  "name": "John Doe",
  "query": 
RAW_STRING_SSON_START
SELECT * FROM users WHERE name = "John"
RAW_STRING_SSON_END
,
  "status": "active"
}
```

### JSON
```json
{
  "name": "John Doe",
  "query": "SELECT * FROM users WHERE name = \"John\"",
  "status": "active"
}
```

## Example 6: Array of Strings

### SSON
```sson
[
  "simple",
  RAW_STRING_SSON_START
complex "with quotes"
RAW_STRING_SSON_END
,
  RAW_STRING_SSON_START
multi
line
RAW_STRING_SSON_END
]
```

### JSON
```json
[
  "simple",
  "complex \"with quotes\"",
  "multi\nline"
]
```