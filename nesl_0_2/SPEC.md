# NESL Language Specification

https://claude.ai/chat/5a340d7a-d2e3-4554-be6d-037fbfa52e2c

NESL (NEsted String Literal) is a line-oriented configuration language designed for embedding structured data in mixed content.

## Core Principles

1. **Line-oriented**: Each line is processed atomically. No line continuations.
2. **Context-sensitive**: Line interpretation depends on parser state.
3. **String-only values**: All leaf values are UTF-8 strings.
4. **Whitespace-preserving**: Whitespace in strings preserved exactly.

## Document Structure

### Block Wrappers

NESL content must be wrapped in block markers:

```
<<<<<<<<<nesl
{
  key = R"""pv(value)pv"""
}
=========nesl
```

**Rules:**
- Block markers must be alone on their lines
- Opening `{` or `[` must be only non-whitespace on line after `<<<<<<<<<nesl`
- Closing `}` or `]` must be only non-whitespace on line before `=========nesl`
- No lines allowed between closing delimiter and `=========nesl`
- Multiple blocks parsed independently into an array

## String Literals

### Format
```
R"""pv(content)pv"""
```

### Parsing Algorithm
1. Verify line starts with `R"""pv(`
2. Find LAST occurrence of `)pv"""` on the line
3. Extract content between first `R"""pv(` and last `)pv"""`
4. Verify only whitespace follows closing `)pv"""`
5. Any non-whitespace after closing → Error

### Examples
```nesl
simple = R"""pv(hello world)pv"""
empty = R"""pv()pv"""
tricky = R"""pv(contains )pv""" and also the entire R"""pv(delimiters)pv""" in text)pv"""
```

tricky:
```
contains )pv""" and also the entire R"""pv(delimiters)pv""" in text
```

## Objects

### Syntax
```nesl
{
  key = R"""pv(value)pv"""
  nested = {
    inner = R"""pv(value2)pv"""
  }
}
```

### Rules
- Opening `{` and closing `}` must be on separate lines
- Keys: Any UTF-8 except whitespace, `=`, or zero-width characters
- Duplicate keys allowed (last wins)
- Values can be: strings, objects, arrays, or multiline strings

## Arrays

### Syntax
```nesl
[
  - R"""pv(item1)pv"""
  - {
    key = R"""pv(item2)pv"""
  }
  - [
    - R"""pv(nested)pv"""
  ]
]
```

### Rules
- Opening `[` and closing `]` must be on separate lines
- Each element prefixed with `-`
- Empty arrays must be exactly `[]` with no whitespace between

## Multiline Strings

### Syntax
```nesl
text = (
  R"""pv(Line 1)pv"""
  R"""pv(Line 2)pv"""
)
```

### Rules
- Only string literals allowed inside
- Lines joined with `\n`
- Empty multiline `()` produces empty string

## Parser State Machine

### States
- **OBJECT**: Expects assignments or `}`
- **ARRAY**: Expects array elements or `]`
- **MULTILINE**: Expects string literals or `)`

### Line Classification
- `key =` → Assignment (if in OBJECT)
- `-` → Array element (if in ARRAY)
- `{` → Object start
- `}` → Object end
- `[` → Array start
- `]` → Array end
- `(` → Multiline start
- `)` → Multiline end
- `R"""pv(` → String literal (if in MULTILINE)

### Context Rules
- Assignments only in OBJECT state
- Array elements only in ARRAY state
- Only strings in MULTILINE state
- Mismatched delimiters are fatal

## Error Handling

### Fatal (abort block)
- Mismatched delimiters
- Unclosed structures
- Missing block markers
- Content between `}` and `=========nesl`

### Recoverable (skip line)
- Invalid keys
- Malformed strings
- Context violations
- Content after string literal

## Processing Rules

- Blank lines ignored
- Whitespace-only lines ignored
- Line endings normalized to `\n`
- No Unicode normalization

## Example

Input:
```nesl
<<<<<<<<<nesl
{
  name = R"""pv(Config)pv"""
  items = [
    - R"""pv(first)pv"""
    - R"""pv(second)pv"""
  ]
  description = (
    R"""pv(Multi)pv"""
    R"""pv(line)pv"""
  )
}
=========nesl
```

Output:
```json
[{
  "name": "Config",
  "items": ["first", "second"],
  "description": "Multi\nline"
}]
```


## Configurable Syntax

The parser supports configurable syntax markers. While the default markers are `R"""pv(`, `)pv"""`, `<<<<<<<<<nesl`, and `=========nesl`, these can be customized when initializing the parser. This allows NESL to be adapted for different contexts where the default markers might conflict with content.

## Ambiguities remaining:

Actually missing/unclear:

String parsing edge case - SPEC is genuinely ambiguous here. Line says "find LAST occurrence" but doesn't specify the multiple-literals-per-line behavior from the original doc.
    String parsing edge case - What happens with R"""pv(first)pv""" R"""pv(second)pv""" on one line? The original doc showed this becomes "first)pv\"\"\" R\"\"\"pv(second" but SPEC doesn't clarify this behavior


EOF handling - Not specified anywhere. Fatal error? Where in parse tree does partial data go?
    EOF handling - What happens if file ends mid-structure?

Error recovery boundaries - SPEC says "skip line" but doesn't define which errors are skippable. Can you skip a line with { and continue parsing? Probably not, but unclear.
    Error recovery specifics - Which line types can be skipped vs which abort parsing

Character encoding - UTF-8 only! No BOMs?



Recommendation:  add to SPEC.md:

Clarify the string literal line behavior
Add EOF handling rule
List which line types are recoverable vs fatal

############################

Whitespace-only lines in multiline blocks are ignored

we need some reasonable maximum lenghts for keys and values (max value length can be much longer ofc)