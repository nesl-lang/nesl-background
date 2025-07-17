# NESL Parser Architecture

TDD development - red/green/refactor

## Purpose 

a syntax language that LLMs can read and write with maximum ease.  so it needs to be simple and obvious but also restrictive enough that the internet wont get littered with variations in training data.  solves the problem of LLMs easily getting confused re: whitespace (especially leading whitespace) in strings and complex char escaping in json, yaml, etc

## Overview

Two-pass parser design:
1. **Block extraction** - Isolates NESL content from mixed documents
2. **NESL parsing** - Parses each block independently

This separation enables clean error boundaries and simplified line tracking.

## Component Architecture

### 1. Block Extractor (`extractBlocks`)

**Purpose**: Extract NESL blocks from mixed content, handling arbitrary text between blocks.

**Input**: Full document string  
**Output**: Array of blocks with content and line numbers, or fatal errors

**Testing**: Unit tests in `nesl-test/tests/unit/block-extraction/`. Tests verify block boundary detection, line number tracking, and error cases (unclosed blocks, orphaned markers) in isolation.

**Algorithm**:
- Line-by-line scan for block markers
- Track state: in-block or outside-block
- Accumulate lines between markers
- Record start line for each block

**Edge cases**:
- Nested block markers → fatal error
- Unclosed block at EOF → fatal error  
- Block markers inside string literals → ignored (not parsed yet)
- Empty blocks (`<<<<<<<<<nesl\n=========nesl`) → valid, empty content

**Example processing**:
```
Line 1: Some text          [ignored]
Line 2: <<<<<<<<<nesl      [block start, record line 2]
Line 3: {                  [accumulate]
Line 4: }                  [accumulate]
Line 5: =========nesl      [block end, emit block]
Line 6: More text          [ignored]
```

### 2. String Parser (`parseStringLiteral`)

**Purpose**: Extract string value from a complete line containing only a string literal.

**Input**: Single line (trimmed or untrimmed)  
**Output**: String value or specific error code

**Testing**: Unit tests in `nesl-test/tests/unit/string-literals/`. Tests verify delimiter parsing, edge cases (multiple markers, unterminated strings), and custom delimiter support in isolation.

**Algorithm**:
1. Trim input
2. Verify starts with `R"""pv(`
3. Find LAST occurrence of `)pv"""`
4. Verify nothing after closing marker
5. Extract content between markers

**Critical behavior**: Multiple markers on one line capture everything between first open and last close:
- Input: `R"""pv(first)pv""" R"""pv(second)pv"""`
- Output: `first)pv""" R"""pv(second`

**Edge cases**:
- Empty string: `R"""pv()pv"""` → `""`
- Contains delimiter: `R"""pv(text )pv""" more)pv"""` → `text )pv""" more`
- No closing marker → `string_unterminated`
- Content after marker → `content_after_string`
- Marker not at start → `invalid_string_start`

### 3. NESL Parser (`parseBlock`)

**Purpose**: Parse structured NESL content using recursive descent with explicit state tracking. Each block must be a root-level object.

**Input**: Block content (no markers), starting line number  
**Output**: Parsed object tree and non-fatal errors

**Testing**: see unit test files in  /Users/stuart/repos/nesl-lang/nesl-test/tests/unit/block-parser

**State machine design**:
- Three states: OBJECT, ARRAY, MULTILINE
- Context stack for nested structures
- Line-by-line processing with state-dependent interpretation

#### Line Classification

Each line is classified before processing:

1. **Structural delimiters**: `{`, `}`, `[`, `]`, `(`, `)`
2. **Assignment**: `key = ...` (contains `=` with non-empty key)
3. **Array element**: `- ...` (starts with dash-space)
4. **String literal**: Starts with `R"""pv(`
5. **Blank**: Empty or whitespace only
6. **Unknown**: Anything else

#### State Handlers

**OBJECT State**:
- Accepts: assignments, `}`, nested structure starts
- Rejects: array elements (`-`), bare strings
- Tracks: duplicate keys for error reporting

Valid lines:
- `key = R"""pv(value)pv"""` → add to object
- `key = {` → push context, enter OBJECT state
- `key = [` → push context, enter ARRAY state  
- `key = (` → push context, enter MULTILINE state
- `}` → pop context or complete if root

**ARRAY State**:
- Accepts: array elements, `]`, nested structures after `-`
- Rejects: assignments, bare strings

Valid lines:
- `- R"""pv(value)pv"""` → add to array
- `- {` → push context, enter OBJECT state
- `- [` → push context, enter ARRAY state
- `]` → pop context or complete if root

**MULTILINE State**:
- Accepts: string literals, `)`
- Rejects: ALL other line types
- Accumulates strings with `\n` joining

Valid lines:
- `R"""pv(content)pv"""` → accumulate
- `)` → join strings, pop context

#### Error Recovery Strategy

**Recoverable errors** (skip line, continue parsing):
- `invalid_key`: Key contains spaces/equals
- `string_unterminated`: Missing close marker
- `content_after_string`: Extra content after string
- `invalid_context`: Wrong syntax for current state
- `duplicate_key`: Key already defined

**Fatal errors** (stop parsing structure):
- `delimiter_mismatch`: Wrong closing delimiter (expected `}` got `]`)
- `unclosed_structure`: EOF with open structures
- Any error that breaks state machine consistency

**Recovery mechanism**:
- Skip current line
- Remain in current state
- Continue with next line
- Exception: After delimiter mismatch, close current structure and continue in parent

#### Key Validation

Keys must not contain:
- Whitespace (space, tab, newline)
- Equals sign (`=`)
- Empty string

Maximum length: 256 characters (configurable)

#### Duplicate Key Handling

- Maintain `Set<string>` per object
- On duplicate: 
  - Use new value (last wins)
  - Add error with both line numbers
  - Continue parsing

Example:
```
{
  host = R"""pv(localhost)pv"""      # Line 2
  port = R"""pv(5432)pv"""           # Line 3  
  host = R"""pv(production)pv"""     # Line 4 - Error: duplicate key
}
```

Result: `{host: "production", port: "5432"}` with error reported

#### Line Number Tracking

File-relative line = block.startLine + block-relative line

Example:
- Block starts at file line 10
- Error on 3rd line of block
- Report error at file line 13

### 4. Main Parser (`parse`)

**Purpose**: Orchestrate the two-pass parsing and merge results.

**Testing**: Integration tests in `nesl-test/tests/integration/`. Tests verify the complete parsing pipeline including block extraction, parsing, and error aggregation across multiple blocks.

**Algorithm**:
1. Extract blocks
2. If block errors, return them (fatal)
3. Parse each block independently
4. Merge values and errors
5. Return combined result

**Error aggregation**:
- All block extraction errors are fatal
- Parser errors are collected across all blocks
- Line numbers adjusted to file-relative

## Error Reporting Format

All errors include:
- `line`: File-relative line number (1-based)
- `code`: Specific error identifier
- `message`: Human-readable description
- `content`: The problematic line
- `context`: 5 (if available) lines context window around error -- relative to the file, not just the code block

Context generation:
- Target line in middle when possible
- Clamp to file boundaries
- Include enough for pattern recognition

## Configuration

Customizable markers:
- `stringOpen` / `stringClose`: String delimiters
- `blockStart` / `blockEnd`: Block markers
- `maxKeyLength`: Key length limit
- `maxValueLength`: String value limit

## Implementation Notes

1. **No regex for parsing** - Line classification uses simple string operations
2. **Immutable parsing** - Never modify input, build new structures
3. **Eager error collection** - Report all errors, don't stop at first
4. **Explicit state** - No implicit state in variables, use context stack
5. **UTF-8 throughout** - No special handling, JavaScript native

## Line Number Conventions

### Fundamental Rules

1. **All line numbers are 1-based** - The first line of any file or string is line 1, not line 0.
2. **All line numbers in the API are file-relative** - They refer to positions in the original input file, not relative to block boundaries.

### Block.startLine Semantics

The `startLine` field in a `Block` represents the line number where the `<<<<<<<<<nesl` marker appears, NOT the first content line.

**Example:**
```
Line 1: Some text
Line 2: <<<<<<<<<nesl
Line 3: {
Line 4:   key = value
Line 5: }
Line 6: =========nesl
```

This produces:
```typescript
{
  content: "{\n  key = value\n}",  // Lines 3-5
  startLine: 2                     // Line of <<<<<<<<<nesl marker
}
```

### Error Line Numbers

Error line numbers are always file-relative. When parsing block content:

1. Block parser receives `block.startLine` (the marker line)
2. For content line N (0-based index), the file line is: `block.startLine + N + 1`
3. This accounts for: marker line + zero-based content index + 1 for next line

**Example:**
- Block marker at file line 10
- Error on first line of block content (index 0)
- File line for error: 10 + 0 + 1 = 11

### Why This Design?

- **Consistency**: All line numbers in the API refer to the same coordinate system (the original file)
- **Debugging**: Errors can be traced directly to file positions without mental translation
- **Block extraction**: The marker line is semantically where the block "starts" in the file

## Unresolved Questions

1. Should `key =` alone (no value) be an error or wait for next line?
2. Maximum nesting depth enforcement?
3. Should whitespace-only lines in multiline blocks add empty strings or be ignored?
4. Performance impact of maintaining duplicate key sets?

# Design Decisions Addendum

## Resolved Architecture Decisions

### String Parser Interface

**Decision**: Extract value portion before invoking string parser.

**Implementation Pattern**:
```
1. Find assignment operator position
2. Extract substring after operator
3. Trim whitespace
4. Pass to string parser
```

**Rationale**: Maintains single responsibility - string parser handles only string literal validation, not partial line parsing.

### Multiline Whitespace Behavior

**Decision**: Skip blank lines in MULTILINE state. Only accumulate actual string literals.

**Behavior**:
- Blank lines (empty or whitespace-only): ignored
- Explicit empty strings `R"""pv()pv"""`: preserved as empty strings in output
- Lines not starting with string delimiter: error

**Rationale**: Matches test expectations and improves readability of multiline content.

### Delimiter Mismatch Recovery

**Decision**: Fatal for current structure only. Close structure with error, continue parsing in parent context.

**Recovery Process**:
1. Add error to errors array
2. Return current structure (partially parsed)
3. Pop context stack
4. Continue parsing if parent exists, otherwise end

**Example**: In nested structure, `}` found when `]` expected closes array with error, continues in parent object.

**Rationale**: Maximizes parse tree preservation while preventing cascading confusion.

### Error Context Window

**Decision**: Universal 5-line context window for all errors.

Context generation follows a 5-line window approach. The error line appears at line 3 (center) when possible, with 2 lines before and 2 lines after. Near input boundaries, the window shifts to maintain 5 lines total - errors on line 1-2 show lines 1-5, errors near EOF show the last 5 lines. For inputs shorter than 5 lines, the entire input serves as context. EOF errors, having no specific line, display the final 5 lines of input. Windows clamp to file/block boundaries.

**Rationale**: Industry-standard practice balancing sufficient context with minimal noise.

### Maximum Nesting Depth

**Decision**: 100 levels maximum.

**Implementation**:
- Track depth via context stack size
- Error when attempting to push 101st context
- Configurable via parse options

**Error Response**:
- Code: `max_depth_exceeded`
- Message: "Maximum nesting depth (100) exceeded"

**Rationale**: Prevents stack overflow attacks while exceeding all reasonable use cases.

### Duplicate Key Performance

**Decision**: Use language-native set/hash structures without optimization.

**Implementation**:
- One set per object tracking seen keys
- Check membership before adding
- No special optimization for large objects

**Rationale**: Native set operations are O(1) average case. Real-world objects rarely exceed 1000 keys. Optimization deferred until proven necessary.

### Empty Assignment Handling

**Pattern**: `key =` with no value

**Decision**: Immediate syntax error.

**Error Response**:
- Code: `invalid_context`
- Message: "Assignment requires value on same line"

**Rationale**: Consistent with line-oriented principle. Avoids parser state complexity for line continuation detection.

## Configuration Additions

The following limits should be configurable:

```
ParseOptions {
  maxNestingDepth: number     // default: 100
  // ... existing options
}
```

This enables adjustment without code modification if requirements change.

## Configuration Handling

All parser components accept optional configuration through a unified `ParseOptions` interface:

```typescript
interface ParseOptions {
  stringOpen?: string;   // default: 'R"""pv('
  stringClose?: string;  // default: ')pv"""'
  blockStart?: string;   // default: '<<<<<<<<<nesl'
  blockEnd?: string;     // default: '=========nesl'
  maxKeyLength?: number; // default: 256
  maxValueLength?: number; // default: 1048576
}
```

**Component responsibilities:**
- `extractBlocks()` - uses `blockStart/blockEnd` only
- `parseStringLiteral()` - uses `stringOpen/stringClose` only
- `parseBlock()` - passes `stringOpen/stringClose` to string parser
- `parse()` - passes full config to all components

**Test configuration:**
Test cases specify custom markers via JSON metadata:

```json
{
  "config": {
    "blockStart": "<<<START>>>",
    "blockEnd": "===END===",
    "stringOpen": "%%%[",
    "stringClose": "]%%%"
  },
  "expected": [{"key": "value"}],
  "errors": []
}
```

Missing config fields use defaults. This enables testing parser behavior with arbitrary syntax markers while maintaining backward compatibility.

**Implementation pattern:**
```typescript
function parseBlock(content: string, startLine: number, options?: ParseOptions) {
  const config = { ...defaultConfig, ...options };
  // Pass config.stringOpen/Close to parseStringLiteral()
}
```

testing: Run entire test suite with different configs:

Default markers
Custom markers set 1: %%%[...]%%%, <<<START>>>/===END===
Custom markers set 2: {{...}}, ---BEGIN---/---FINISH---

This verifies parser doesn't hardcode delimiters anywhere.
Implementation: Test runner accepts config override:
bashnpm test -- --config custom1.json
Catches hardcoded string literals that should use config.

# future concerns:

brainstorm more about this:Main Parser (parse)
Purpose: Orchestrate the two-pass parsing and merge results.
Testing: Integration tests in nesl-test/tests/integration/.will we need more test cases to cover this?  or we have enough already.  wdyt?EditLooking at the main parser's responsibilities:

Call extractBlocks()
If block errors → return them (fatal)
For each block: call parseBlock()
Merge values and errors
Adjust line numbers to file-relative

The existing integration tests don't explicitly verify orchestration edge cases:
Missing coverage:

Mixed success/failure across blocks - What if block 1 parses fine but block 2 has errors? The architecture says "If ANY block has errors, return only errors (no data array)" but I don't see tests for this.
Line number adjustment - When block 2 starts at line 20 and has an error on its line 3, does the error report line 23? Integration tests might verify this implicitly, but it's not clear.
Empty input - What does parse("") return? {data: [], errors: []} or error?
Block extraction fatal vs parser non-fatal - Architecture distinguishes these but tests don't verify the boundary.

Looking at the concatenated tests, most integration tests have either:

Single block (no orchestration complexity)
Multiple successful blocks
Errors within a single block

The /integration/blocks/ directory has multi-block tests but they're all successful parses. The /integration/errors/ directory has single-block error cases.
Verdict: Need 2-3 more integration tests for orchestration edge cases, particularly mixed success/failure across multiple blocks.