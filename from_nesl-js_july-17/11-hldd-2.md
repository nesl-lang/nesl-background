# TELT Parser Design Document

## Overview

TELT (Text Encoding for Language-model Tasks) is a line-based syntax for encoding structured data blocks. The parser converts TELT text into structured JSON while providing detailed diagnostics for syntax errors.

## Syntax Specification

### Block Structure
```
#!telt [3-char SHA: xyz]
// Optional comment (stripped)
=== SECTION_NAME ===
--PROPERTY_NAME xyz--
property value content
spans multiple lines
--END xyz--
```

### Syntax Rules
1. All delimiters must start at line beginning (no leading whitespace)
2. Hash in all delimiters must match block's declared hash
3. Property values include all content lines until next delimiter
4. Multiple sections per block result in array output
5. Repeated property names create arrays
6. Comments only stripped from TELT syntax lines, not content

## Parser Output

### Successful Parse
```json
{
  "blocks": [
    {
      "hash": "xyz",
      "start_line": 1,
      "end_line": 8,
      "sections": [
        {
          "name": "CREATE_FILE",
          "start_line": 3,
          "end_line": 7,
          "properties": {
            "FILE": "test.txt",
            "CONTENT": "Hello\nworld"
          }
        }
      ]
    }
  ],
  "diagnostics": []
}
```

### Parse with Errors
```json
{
  "blocks": [...],
  "diagnostics": [
    {
      "range": {
        "start": { "line": 7, "character": 0 },
        "end": { "line": 7, "character": 10 }
      },
      "severity": 1,
      "code": "HASH_MISMATCH",
      "message": "Expected hash 'xyz' but found 'abc'",
      "context": {
        "block_start": 1,
        "section": "CREATE_FILE",
        "section_start": 3
      }
    }
  ]
}
```

## State Machine

### States
- `OUTSIDE_BLOCK`: Scanning for `#!telt`
- `IN_BLOCK`: After block start, before first section
- `IN_SECTION`: After `=== X ===`, expecting properties
- `IN_PROPERTY`: Collecting property value lines

### Line Types
- `BLOCK_START`: `#!telt [3-char SHA: xyz]`
- `SECTION_START`: `=== NAME ===`
- `PROPERTY_START`: `--NAME hash--`
- `BLOCK_END`: `--END hash--`
- `CONTENT`: Any other line

### Key Transitions
```
OUTSIDE_BLOCK + BLOCK_START → IN_BLOCK
IN_BLOCK + SECTION_START → IN_SECTION
IN_SECTION + PROPERTY_START → IN_PROPERTY
IN_PROPERTY + PROPERTY_START → IN_PROPERTY (array)
IN_PROPERTY + BLOCK_END → OUTSIDE_BLOCK
```

### Error Recovery
On hash mismatch: Abort block, scan for next `#!telt`

## Implementation Notes

### Line Identification
Use minimal regex only for line type detection:
- `^#!telt \[3-char SHA: ([a-z0-9]{3})\]`
- `^=== ([A-Z_]+) ===$`
- `^--([A-Z_]+) ([a-z0-9]{3})--$`
- `^--END ([a-z0-9]{3})--$`

### Property Arrays
When property name repeats:
```
current_properties[name] = is_array(current_properties[name]) 
  ? [...current_properties[name], new_value]
  : [current_properties[name], new_value]
```

### Whitespace Preservation
- Empty value: `""`
- Newline only: `"\n"`
- Mixed whitespace: `"  \t\n  "`

### Comment Handling
Strip only from TELT delimiter lines:
```
if line_type in [BLOCK_START, SECTION_START, PROPERTY_START, BLOCK_END]:
    line = strip_comment(line)
```

## Diagnostics

### Severity Levels
- `1`: Error (syntax violations)
- `2`: Warning (future use)
- `3`: Information (future use)

### Error Codes
- `INVALID_BLOCK_START`: Malformed `#!telt` line
- `HASH_MISMATCH`: Delimiter hash doesn't match block
- `UNCLOSED_BLOCK`: EOF before `--END`
- `INVALID_SECTION`: Malformed `=== X ===`
- `ORPHANED_PROPERTY`: Property outside section

### Context Information
Each diagnostic includes hierarchical position:
- File line number (1-based)
- Character position (0-based)
- Block start line
- Section name and start line (if applicable)

## Design Decisions

### Hash Mismatch = Block Abort
Rationale: Hash confusion indicates fundamental error. Continuing would produce unreliable structure.

### Flat Diagnostics Array
Follows Language Server Protocol standard. Enables IDE integration without custom adapters.

### No Semantic Validation
Parser only validates structure. Section names and property requirements validated elsewhere.

### Stream Processing
Line-by-line processing enables large file handling without memory constraints.

## Test Coverage Requirements

1. Valid syntax variations (examples 1-26 from spec)
2. Hash mismatch recovery
3. Unclosed blocks
4. Property arrays
5. Whitespace edge cases
6. Multi-block files
7. Comment stripping

## Cross-Language Implementation

Avoid language-specific features:
- No regex lookahead/behind
- Basic data structures only
- Explicit state tracking
- Simple string operations

Shared test suite format enables validation across implementations.