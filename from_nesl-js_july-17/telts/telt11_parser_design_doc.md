# TELT Parser Design Document

## Overview

TELT (Text Encoding for Language-model Tasks) is a syntax designed for LLMs to specify filesystem operations. The parser must handle malformed input gracefully, provide actionable error messages for LLM correction, and ensure safe execution of potentially destructive operations.

## Core Requirements

### Primary Goals
- Parse TELT blocks written by LLMs for filesystem operations
- Continue parsing after errors to identify multiple issues in one pass
- Provide rich error context enabling targeted LLM fixes
- Execute only fully validated operations to prevent filesystem corruption
- Support IDE integration with precise error locations

### Design Constraints
- Line-based processing (no complex lookahead)
- No nesting or escaping required
- Each TELT block independently parseable
- Cross-language implementation (Node.js reference, Python/Rust ports planned)

## TELT Syntax Specification

### Block Structure
```
#!telt [3-char SHA: xyz]    // Block start with hash
// Optional comments         // Stripped during parsing
=== COMMAND_NAME ===        // Command section start
--PARAM_NAME xyz--          // Parameter delimiter (hash must match)
parameter value content     // Multi-line values preserved exactly
--END xyz--                 // Block end (hash must match)
```

### Key Rules
1. Delimiters must start at beginning of line (no leading whitespace)
2. Hash in delimiters must match block's 3-character SHA
3. Parameter values include ALL lines until next delimiter
4. Multiple command sections per block create JSON array
5. Repeated parameter names create parameter value arrays
6. Comments (`//`) stripped from TELT syntax lines only, NOT from content

## Parser Architecture

### Three-Layer Design

#### 1. Parsing Layer
Builds AST-like structure while collecting all errors:
- Process multiple TELT blocks per file independently
- Continue parsing despite errors (panic-mode recovery)
- Preserve exact content including whitespace
- Track line numbers for all elements

#### 2. Validation Layer
Safety checks before execution:
- Verify hash consistency throughout block
- Validate known commands and required parameters
- Flag unknown commands (parse but don't execute)
- Assess block-level and command-level validity

#### 3. Execution Layer
Conservative operation execution:
- Execute only fully validated blocks
- Skip entire block if hash mismatch detected
- Transaction-like semantics where possible
- Detailed logging of executed/skipped operations

## State Machine Design

### States
- `OUTSIDE_BLOCK`: Looking for `#!telt` pattern
- `IN_BLOCK`: Inside block, expecting commands or `--END`
- `IN_COMMAND`: Inside command section, expecting parameters
- `IN_PARAMETER`: Collecting parameter value lines
- `RECOVERING`: Error recovery mode, seeking next sync point

### Events (Line Types)
- `TELT_START`: Matches `#!telt [3-char SHA: xyz]`
- `COMMAND_START`: Matches `=== COMMAND_NAME ===`
- `PARAM_START`: Matches `--PARAM_NAME hash--`
- `BLOCK_END`: Matches `--END hash--`
- `CONTENT_LINE`: Any other line

### Transitions
```
OUTSIDE_BLOCK + TELT_START → IN_BLOCK (extract/store hash)
IN_BLOCK + COMMAND_START → IN_COMMAND (start new command)
IN_COMMAND + PARAM_START → IN_PARAMETER (validate hash)
IN_PARAMETER + PARAM_START → IN_PARAMETER (new param, may create array)
IN_PARAMETER + BLOCK_END → IN_BLOCK (finalize command)
IN_BLOCK + BLOCK_END → OUTSIDE_BLOCK (finalize block, emit array)
ANY_STATE + ERROR → RECOVERING (seek sync point)
```

## Error Recovery Strategy

### Synchronization Points
Used for panic-mode recovery after errors:
- `#!telt` - New block boundary
- `=== X ===` - Command boundary  
- `--X hash--` - Parameter boundary
- `--END hash--` - Block end boundary

### Recovery Rules
1. On hash mismatch: Record error, continue parsing, mark block invalid
2. On malformed command: Skip to next `===` or `--END`
3. On orphaned parameter: Skip to next sync point
4. On unclosed block at EOF: Report with start location

### Error Severity Levels
- `block_fatal`: Entire block unusable (e.g., hash mismatch)
- `command_error`: Command skipped but block continues
- `parameter_warning`: Parameter issue but command may execute
- `syntax_info`: Non-fatal issues for LLM awareness

## Error Message Format

```json
{
  "code": "HASH_MISMATCH",
  "message": "Block hash 'x9z' doesn't match delimiter hash 'x9y'",
  "severity": "block_fatal",
  "line_number": 42,
  "column": 1,
  "content": "--END x9y--",
  "context_window": "line 40: content\nline 41: content\nline 42: --END x9y--  <-- ERROR HERE\nline 43: content\nline 44: content",
  "block_context": {
    "start_line": 10,
    "end_line": 45,
    "block_hash": "x9z",
    "commands_parsed": 2
  },
  "fix_hint": "Change delimiter to '--END x9z--' to match block hash"
}
```

## Special Handling

### Parameter Arrays
When same parameter appears multiple times:
```telt
--FILE abc--
first.txt
--FILE abc--
second.txt
```
Results in: `"FILE": ["first.txt", "second.txt"]`

### Empty/Whitespace Values
Preserved exactly:
- Empty: `""` 
- Single newline: `"\n"`
- Whitespace: `"    \t\t  "`

### Comment Stripping
- Strip from: `#!telt [3-char SHA: x9z] // comment here`
- Preserve in: Parameter values (could be actual code comments)

## Output Format

### Success Case
```json
{
  "blocks": [
    {
      "commands": [
        {
          "type": "CREATE_FILE",
          "params": {
            "FILE": "test.txt",
            "CONTENT": "Hello world"
          }
        }
      ],
      "metadata": {
        "start_line": 1,
        "end_line": 8,
        "hash": "x9z"
      }
    }
  ],
  "errors": [],
  "summary": {
    "blocks_parsed": 1,
    "blocks_valid": 1,
    "commands_found": 1
  }
}
```

### Error Case
```json
{
  "blocks": [...],  // Partial successes included
  "errors": [...],  // All errors found
  "summary": {
    "blocks_parsed": 3,
    "blocks_valid": 1,
    "commands_found": 5,
    "commands_valid": 2
  }
}
```

## Implementation Guidelines

### Parser Implementation
1. Single-pass line-by-line processing
2. Minimal regex (only for line type identification)
3. Track state + current block/command/parameter
4. Accumulate all errors, don't fail fast
5. Build complete structure before validation

### Cross-Language Portability
- Use simple data structures (maps, arrays, strings)
- Avoid language-specific features
- Clear state machine pattern
- Comprehensive test suite with edge cases

### Performance Considerations
- Stream processing for large files
- Lazy validation (parse all, validate on demand)
- Efficient line type detection (check first chars)

## LLM-Specific Optimizations

### Error Patterns
Parser designed for common LLM mistakes:
- Hash confusion (mixing similar 3-char codes)
- Delimiter alignment (wrong indentation)
- Block boundary loss (forgetting --END)
- Command typos (CRAETE_FILE vs CREATE_FILE)

### Fix Hints
Each error includes actionable correction:
- Specific line to change
- Exact replacement text
- Context showing the problem
- Severity to prioritize fixes

## Safety Considerations

### Execution Guards
1. Never execute blocks with hash mismatches
2. Skip commands with missing required parameters
3. Validate file paths before operations
4. Log all execution decisions

### Future Extensions
- Command whitelisting/blacklisting
- Dry-run mode for validation
- Rollback capability for operations
- Sandbox execution environment

## Test Strategy

### Test Categories
1. Valid syntax variations (examples 1-26)
2. Hash mismatch scenarios
3. Malformed commands
4. Edge cases (empty values, special chars)
5. Recovery scenarios
6. Multi-block files
7. Performance tests (large files)

### Test File Repository
Shared test cases across implementations:
- JSON format for test case definition
- Expected parse output
- Expected error messages
- Cross-implementation validation