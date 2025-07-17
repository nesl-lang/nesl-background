


Is this valid? Does it create an empty string or is it an error?

empty string

2- ok lets just do this then: Most languages require [A-Za-z][A-Za-z0-9_]* for identifiers.

3- 3. Multiple Blocks with Same ID
yes thats' fine

4- normalize to LF like git does 

-5 a comment can be on any line.  no inline comments tho.  full line comments only

-6. Error Recovery Strategy

idk.  this needs more brainstorming for now.  in the document, just list this as a TODO and mention everything we know about it so far.

-7
"preserves all content literally" - does this include the final newline before the delimiter? Most heredoc implementations strip it.

strip this

------------

> ok now start over and regenerate the entire specs/reqs/design-doc for SHAM.  lean but also fully comprehensive and stand-alone

# SHAM Format Specification

## Overview
SHAM (Single-action Hashed-marker) is a line-oriented configuration format designed for LLM-generated code operations. Each block specifies one action with associated key-value parameters.

## Syntax Definition

### Block Structure
```
#!SHAM [@three-char-SHA-256: XXX]
...block content...
#!END_SHAM_XXX
```

### Grammar Rules
- **Headers**: `#!SHAM [@three-char-SHA-256: XXX]` where XXX matches `[A-Za-z0-9]{3}`
- **Keys**: `[A-Za-z][A-Za-z0-9_]*` (letter start required)
- **Values**: Must be quoted string or heredoc
  - Quoted: `"..."` (no escapes, no newlines)
  - Heredoc: `<<'EOT_SHAM_XXX'` followed by content lines and `EOT_SHAM_XXX`
- **Comments**: `//` at line start (full-line only, no inline)
- **End marker**: `#!END_SHAM_XXX` must match header marker
- **Case**: ALL uppercase for keywords (SHAM, END_SHAM, EOT_SHAM)

### Whitespace and Line Endings
- Line endings normalized to LF
- Spaces around `=` optional
- Empty lines allowed anywhere in block body
- Heredoc content preserves internal whitespace exactly
- Final newline before heredoc delimiter is stripped

### Multiple Blocks
- Multiple blocks with same marker ID allowed
- Blocks processed sequentially

## Parser Requirements

### Error Handling
- Collect all errors in single pass
- Continue parsing to find maximum errors
- Return both parsed blocks AND error list

### TODO: Error Recovery Strategy
Current considerations:
- Need to define behavior after malformed header
- Options include: skip to next #!SHAM, attempt key-value parsing, or line-by-line recovery
- Must balance thoroughness with avoiding cascade errors

### Parser Output
```
{
  blocks: [
    {
      id: "XXX",
      properties: { key: "value", ... },
      comments: ["comment text", ...],
      startLine: N
    },
    ...
  ],
  errors: [
    { line: N, message: "description" },
    ...
  ]
}
```

## Design Rationale
- **No ambiguity**: Strict syntax prevents parsing confusion
- **IDE integration**: Predictable structure enables syntax highlighting and validation
- **LLM feedback**: Comprehensive error reporting reduces generation cycles
- **Safety**: Marker system prevents content/delimiter collision

## Implementation Notes
- No type conversion (all values are strings)
- No nesting or complex structures
- State machine with 3 states: SEEKING_HEADER, IN_BLOCK, IN_HEREDOC
- Line-based processing for memory efficiency


Issues with current spec:

## Missing Critical Details

### 1. **Heredoc Edge Cases**
- What if content contains `EOT_SHAM_XXX` at start of line? No escape mechanism specified
- Empty heredoc creates empty string - should specify this explicitly
- Mixed indentation in heredoc - preserved as-is? (should be explicit)

### 2. **Key-Value Rules**
- Can same key appear multiple times in one block? Last wins? Error?
- Are empty values allowed? `key = ""`
- Maximum line length for quoted values?

### 3. **Block Semantics**
- Is `action` key required/special?
- Any reserved key names?
- Order preservation required for keys?

### 4. **Parser Behavior**
- "Line-based processing" conflicts with heredocs spanning multiple lines
- State machine needs to track line numbers for error reporting
- Should parser validate marker is actually 3 chars or accept any length?

### 5. **Ambiguous Requirements**
- "Comments: `//` at line start" - what about leading whitespace? `  // comment`?
- "Empty lines allowed anywhere in block body" - what about between header and first key?
- "Blocks processed sequentially" - implies order matters but doesn't specify for what

### 6. **Missing Examples**
No examples showing:
- Error cases
- Empty heredoc
- Multiple values with same key
- Comments between key-value pairs

## Recommendation
Add explicit "Constraints" section covering these cases. The spec reads like a happy-path description rather than an implementable grammar.