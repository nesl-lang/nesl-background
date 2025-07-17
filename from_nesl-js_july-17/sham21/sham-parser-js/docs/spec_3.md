# SHAM Format Specification

https://claude.ai/chat/0d05bb2a-ff36-4718-acd6-6df5a942222f

remember that error codes and messages in the integration.md test cases are just suggestions.  they are liable to change and probably should change as we build out the parser and see what actually makes sense

## Overview
SHAM (Structured Hashed-marker) is a configuration format designed for LLM-generated code operations. Each block specifies key-value parameters for processing.

## Syntax Definition

### Block Structure
```
#!SHAM [@three-char-SHA-256: XXX]
...block content...
#!END_SHAM_XXX
```

### Grammar Rules
- **Headers**: `#!SHAM [@three-char-SHA-256: XXX]` where XXX is exactly 3 characters matching `[A-Za-z0-9]{3}`
- **Keys**: Unicode letter or underscore start, followed by letters/digits/underscores
  - Pattern: `[\p{L}_][\p{L}\p{N}_]*` (requires Unicode-aware regex)
  - Explicitly excludes: whitespace, control chars (U+0000-U+001F, U+007F-U+009F), zero-width chars (U+200B-U+200D, U+2060, U+FEFF)
  - must be at start of line.  no whitespace allowed before key
- **Comments**: Not supported in SHAM format
- **Values**: Must be quoted string or heredoc
  - Quoted: `"..."` (allow escaping quotes, newlines etc like normal, but maybe throw a warning. and urge the LLM not to do that.)
  - Heredoc: `<<'EOT_SHAM_XXX'` followed by content lines and `EOT_SHAM_XXX`
- **Block content**: Only key-value assignments and empty lines allowed (no comments)
- **End marker**: `#!END_SHAM_XXX` must match header marker XXX
- **Case**: ALL uppercase for keywords (SHAM, END_SHAM, EOT_SHAM)

### Whitespace and Line Endings
- Line endings normalized to LF
- Spaces around `=` optional
- Empty lines allowed anywhere (including between header and first key)
- Heredoc content preserves all internal characters exactly including all whitespace 
    - if the block end marker is within a heredoc, it is also treated as plain text.  everything in a heredoc is preserved
- Final newline before heredoc delimiter is stripped
- Trailing spaces and tabs preserved

### Constraints
- Keys must be unique within block (duplicate = error)
- Key length limit: 256 characters
- Block ID: exactly 3 case-sensitive alphanumeric characters
- Empty quoted values permitted: `key = ""`
- Empty heredocs permitted (creates empty string)
- **Heredoc delimiter collision**: If content contains `EOT_SHAM_XXX` at line start, then that heredoc is an empty string.
- No reserved key names
- Block order preserved, key order within block preserved
- Mismatched end markers (e.g., `#!END_SHAM_YYY` when header was `XXX`) treated as content, likely causing parse error

## File Format
- Extension: `.sham`
- Encoding: UTF-8 (no BOM)
- Empty files are valid

## Parser Requirements

### Error Handling
- Collect all errors in single pass
- Continue parsing to find maximum errors
- Return both parsed blocks AND error list

### TODO: Error Recovery Strategy
Current approach (to be refined):
- On malformed header: skip lines until next `#!SHAM` or EOF
- On malformed key-value: skip that line, continue block
- On unclosed heredoc: error at block end marker or next header
- Must balance thoroughness with avoiding cascade errors

### Parser Output
```
{
  blocks: [
    {
      id: "XXX",
      properties: { key: "value", ... },
      startLine: N,
      endLine: N
    },
    ...
  ],
  errors: [
    { line: N, message: "description" },
    ...
  ]
}
```

## Examples

### Valid Usage
```
#!SHAM [@three-char-SHA-256: abc]
_internal_key = "allowed"
path = "/tmp/test.txt"

content = <<'EOT_SHAM_abc'
EOT_SHAM_abc
#!END_SHAM_abc
```

### Error Cases
```
#!SHAM [@three-char-SHA-256: xyz]
key = "value1"
key = "value2" 
#!END_SHAM_xyz

ERROR above: duplicate key 'key'   (note that this line is just plain ignored text in a .sham file bc not in a block)

#!SHAM [@three-char-SHA-256: bad]
content = <<'EOT_SHAM_bad'
This line is fine
EOT_SHAM_bad
This breaks parsing because its unrecognizable content here. should either be a new var or the block end marker
EOT_SHAM_bad
```
ERROR: malformed content after valid heredoc end, or soemthign

## Design Rationale
- **No ambiguity**: Strict syntax prevents parsing confusion
- **IDE integration**: Predictable structure enables syntax highlighting and validation
- **LLM feedback**: Comprehensive error reporting reduces generation cycles
- **Safety**: Marker system prevents content/delimiter collision in most cases

## Implementation Notes
- No type conversion (all values are strings)
- No nesting or complex structures
- Parser may buffer entire heredoc content
- State machine with 3 states: SEEKING_HEADER, IN_BLOCK, IN_HEREDOC

## Error Reporting Addendum

### Error Structure
```json
{
  "code": "DUPLICATE_KEY",
  "line": 42,
  "blockId": "abc",
  "content": "key = \"value2\"",
  "context": "key = \"value1\"\nkey = \"value2\"\npath = \"/tmp/test.txt\"\n\ncontent = <<'EOT_SHAM_abc'",
  "message": "Duplicate key 'key' in block 'abc'"
}
```

- `blockId`: null if error occurs outside/between blocks, otherwise the ID of block being parsed
- `content`: exact line containing error
- `context`: 5-line window with target line verbatim, no markers

### Context Window Algorithm
```
targetLine = error line number (1-based)
totalLines = file line count
start = max(1, targetLine - 2)
end = min(totalLines, targetLine + 2)
if (end - start + 1 < 5 && totalLines >= 5) {
  if (start == 1) end = min(5, totalLines)
  else start = max(1, totalLines - 4)
}
```

### Error Codes
- `MALFORMED_HEADER` - invalid header syntax
- `INVALID_BLOCK_ID` - ID not exactly 3 alphanumeric characters
- `INVALID_ASSIGNMENT_OPERATOR` - assignment operator other than '=' used
- `DUPLICATE_KEY` - key already defined in current block
- `INVALID_KEY` - key doesn't match `[A-Za-z_][A-Za-z0-9_]*`
- `EMPTY_KEY` - assignment without key name
- `MALFORMED_ASSIGNMENT` - line not valid key=value assignment or empty line
- `INVALID_VALUE` - value not quoted string or heredoc
- `UNCLOSED_QUOTE` - missing closing quote
- `UNCLOSED_HEREDOC` - EOF/block end without delimiter
- `HEREDOC_DELIMITER_COLLISION` - content contains delimiter at line start
- `UNCLOSED_BLOCK` - EOF without END_SHAM
- `MISMATCHED_END` - END_SHAM marker doesn't match header

### Design Notes
- Empty heredoc creates empty string value
- All block IDs should be random 3-character segments of SHA-256 hashes
- Multiple errors per line: report most specific error only
- Parser continues after errors to find maximum issues in single pass

---

## Proposed Addendum

### Block ID Generation Method
```
Block IDs MUST be generated as follows:
1. Generate 16 bytes of cryptographically secure random data
2. Compute SHA-256 hash of the random data
3. Base64-encode the hash
4. Take first 3 characters as block ID

This provides IDs with uniform distribution
```

### Heredoc Delimiter Collision Mitigation
```
If content legitimately contains `EOT_SHAM_XXX` at line start:
- Choose a different block ID
- No escaping mechanism provided
- Parser MUST fail if delimiter appears in content
```

### Error Recovery Strategy
```
SEEKING_HEADER state:
- On malformed line: skip line, remain in SEEKING_HEADER

IN_BLOCK state:
- On malformed key-value: skip line, continue block
- On unclosed quote: error on that line, skip line
- On second `#!SHAM`: error on previous block (unclosed), start new block

IN_HEREDOC state:
- On EOF: error at last line (unclosed heredoc)
- On `#!END_SHAM_XXX`: error (unclosed heredoc)
- On `#!SHAM`: error on previous block, start new block
```

### Key Naming Conventions
```
RECOMMENDED (not enforced):
- Use lowercase_snake_case
- Prefix internal/meta keys with underscore
- Avoid `_sham_` prefix (reserved for future use)
```

### Implementation Requirements
```
Parsers MUST:
- Validate UTF-8 encoding (error on malformed sequences)
- Preserve exact key and content bytes (no normalization)
- Maintain source line numbers for all elements
- Support files up to 100MB (larger files MAY work)
```

### No Comments Allowed in SHAM

# follow up thoguhts:

The current error handling is too coarse-grained. Let's think through this:

For the line `key = "value" // inline not allowed`, the parser would:
1. Successfully parse `key = "value"` as a valid assignment
2. Find unexpected content after the closing quote

This is fundamentally different from a malformed assignment where the line doesn't match the pattern at all.

I think we should have a more specific error like:
- `TRAILING_CONTENT` - unexpected content after value
- `INVALID_QUOTED_STRING` - for malformed quotes like your `"she said "oh hi""` example

So for these cases:

```sham
key = "value" // inline not allowed
```
→ `TRAILING_CONTENT` at position after the closing quote

```sham
key = "she said "oh hi""
```
→ `INVALID_QUOTED_STRING` or `UNCLOSED_QUOTE` because the parser hits an unescaped quote inside

**My recommendation**: Let's start building the parser. These edge cases will become much clearer when we're actually implementing the state machine. We'll discover:
- Exactly where parsing fails
- What information we have at that point
- What error would be most helpful to report

Building the parser will force us to be precise about:
- When we transition between states
- What constitutes a complete vs incomplete parse
- How to report errors with maximum helpful context

Let's build it and refine the error codes as we go. The tests give us a great starting point, and we can adjust them based on what makes sense during implementation.

TLDR - use the errors in sham-shared/sham-test/integration.md as guides, not strictly to enforce.  because parsing decisions will likely change how errors are applied

remember that error codes and messages in the integration.md test cases are just suggestions.  they are liable to change and probably should change as we build out the parser and see what actually makes sense