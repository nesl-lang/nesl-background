Great question! Let's identify the pure functions that make sense to extract for clean unit testing:

## Definitely Extract (Pure Functions)

**1. Block ID Validation**
```javascript
validateBlockId(id) -> {valid: boolean, error?: string}
// Input: "abc", "12X", "ab", "a-b"
// Easy to test: 3 chars, alphanumeric only
```

**2. Key Validation**
```javascript
validateKey(key) -> {valid: boolean, error?: string}
// Tests: length limits, valid chars, unicode handling
// Input: "valid_key", "key with spaces", "κλειδί", ""
```

**3. Header Pattern Matching**
```javascript
parseHeader(line) -> {isValid: boolean, blockId?: string}
// Input: "#!SHAM [@three-char-SHA-256: abc]"
// Tests the exact format, extracts ID
```

**4. End Marker Parsing**
```javascript
parseEndMarker(line) -> {isEnd: boolean, blockId?: string}
// Input: "#!END_SHAM_xyz"
```

**5. Assignment Line Parser**
```javascript
parseAssignment(line) -> {type: 'key-value'|'heredoc'|'invalid', key?: string, value?: string, delimiter?: string}
// Handles both "key = "value"" and "key = <<'EOT_SHAM_xxx'"
// This is complex enough to warrant thorough unit testing
```

**6. Quote String Parser**
```javascript
parseQuotedString(str, startPos) -> {value: string, endPos: number, error?: string}
// Input: '"simple"', '"escaped \\"quotes\\""', '"unclosed'
// Critical for correctness
```

**7. Escape Sequence Handler**
```javascript
unescapeString(str) -> string
// Input: 'escaped \\"quotes\\"', 'newline\\n'
// Pure transformation
```

**8. Context Window Generator**
```javascript
getContextWindow(lines, targetLine, windowSize) -> string[]
// For error reporting - pure function on array of lines
```

## Keep Integrated (Not Worth Extracting)

**1. State Transitions**
The state machine logic is tightly coupled with parsing flow. Extracting would add complexity without much benefit.

**2. Error Collection**
Error objects need line numbers, block context, etc. Better to create these in-place.

**3. Heredoc Content Accumulation**
This is stateful by nature and simple enough to not need extraction.

**4. Line Splitting/Normalization**
Too simple to warrant separate testing unless we hit edge cases.

## Unit Test Structure

For the pure functions, we could have YAML test files like:

```yaml
# test-validate-block-id.yaml
tests:
  - input: "abc"
    expected: { valid: true }
  
  - input: "12X"
    expected: { valid: true }
  
  - input: "ab"
    expected: { valid: false, error: "Block ID must be exactly 3 alphanumeric characters" }
  
  - input: "a-b"
    expected: { valid: false, error: "Block ID must contain only alphanumeric characters" }
```

```yaml
# test-parse-assignment.yaml
tests:
  - input: 'key = "value"'
    expected:
      type: "key-value"
      key: "key"
      value: "value"
  
  - input: 'key = <<\'EOT_SHAM_abc\''
    expected:
      type: "heredoc"
      key: "key"
      delimiter: "EOT_SHAM_abc"
  
  - input: "key = unquoted"
    expected:
      type: "invalid"
      error: "Value must be quoted string or heredoc"
```

## Why This Split Makes Sense

The extracted functions are:
- **Deterministic**: Same input always produces same output
- **Focused**: Each does one thing well
- **Complex enough**: They have non-trivial logic worth testing
- **Reusable**: Used multiple times in the parser

The integrated parts are:
- **Stateful**: Depend on parsing context
- **Simple**: Their logic is straightforward
- **Coupled**: Extracting would require passing too much context

This gives us good test coverage on the tricky bits (quote parsing, validation rules) while keeping the main parser flow readable.


Looking deeper, here are a few more functions we could extract:

## Additional Pure Functions Worth Extracting

**1. Line Type Classifier**
```javascript
classifyLine(line) -> 'header' | 'end_marker' | 'assignment' | 'empty' | 'unknown'
// Quick first-pass classification before detailed parsing
// Helps with error messages and flow control
```

**2. Heredoc Delimiter Validator**
```javascript
validateHeredocDelimiter(delimiter, blockId) -> {valid: boolean, error?: string}
// Must be exactly 'EOT_SHAM_' + blockId
// Input: "EOT_SHAM_abc", "abc" -> valid
// Input: "EOT_SHAM_xyz", "abc" -> invalid
```

**3. Column Position Calculator**
```javascript
getErrorPosition(line, pattern) -> {column: number, length: number}
// For precise error marking
// Input: "key = unclosed", /unclosed/ -> {column: 7, length: 8}
```

**4. UTF-8 Character Validator**
```javascript
findInvalidCharPosition(str, validPattern) -> {position: number, char: string} | null
// For detailed key validation errors
// Input: "key name", /[A-Za-z0-9_]/ -> {position: 3, char: ' '}
```

## Maybe Extract (Borderline Cases)

**5. Line Trimming Logic**
```javascript
normalizeLine(line) -> {content: string, originalLength: number}
// Handles trailing whitespace preservation rules
// Only if spec requires complex whitespace handling
```

**6. Error Message Formatter**
```javascript
formatErrorMessage(errorCode, params) -> string
// Input: 'DUPLICATE_KEY', {key: 'test', blockId: 'abc'}
// Output: "Duplicate key 'test' in block 'abc'"
// Only if we want consistent message templates
```

## Probably Not Worth Extracting

- **Block ID extraction from header/end** - Too simple, just a substring
- **Empty line detection** - Just `line.trim() === ''`
- **Final newline stripping** - One-liner

The key insight is that **classifyLine()** could simplify the main state machine significantly:

```javascript
// Instead of multiple regex tests in the state machine:
const lineType = classifyLine(line);
switch(lineType) {
    case 'assignment': ...
    case 'empty': ...
    // etc
}
```

This would make the main parser even cleaner while giving us another easily testable pure function.