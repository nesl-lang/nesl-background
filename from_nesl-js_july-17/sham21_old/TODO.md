
# TODO 

## Completed ✓

1. **Enhanced `parseAssignment` return type** - Implemented with clear error codes and position info
2. **Shared config file** - Created at `sham-shared/config.json` with patterns stored as strings
3. **UTF-8 key support** - Updated spec to allow Unicode letters/digits
4. **Build-time pattern generation** - Script generates `patterns.ts` from config
5. **Test generation from Markdown** - Script parses `integration.md` to create tests

## Next Steps

1. Implement remaining parser functions:
   - `validateBlockId`
   - `validateKey` 
   - `parseHeader`
   - `parseEndMarker`
   - `unescapeString`
   - `getContextWindow`
   - `classifyLine`
   - `validateHeredocDelimiter`
   - `getErrorPosition`
   - `findInvalidCharPosition`

2. Implement main parser state machine in `parser.ts`

3. Write unit tests for individual functions

4. Verify integration tests pass

# but first:

> feel good about this?

**Decent but incomplete**.

**Good fixes**:
- Regex for quote parsing handles escapes correctly
- Position helpers centralize byte calculations
- Build script error handling prevents silent failures

**Still broken**:
1. Position calcs for `INVALID_VALUE` case: `line.substring(equalIndex + 1).trimStart()` logic is convoluted and likely wrong
2. No tests for `getColumn`/`getByteLength` - UTF-8 edge cases untested
3. `EMPTY_KEY` case still brittle - what if line is `  = "value"`? Should find first non-whitespace

**Missing**:
- `classifyLine()` - needed before parser can work
- `parseHeader()` - critical for state machine
- Main parser implementation
- Buffer polyfill for browser environments?

**Architectural issue**: `parseAssignment` returns 1-based positions but doesn't know its line number. Main parser needs to track line numbers separately. Error-prone.

**Alternative**: Make `parseAssignment` return 0-based positions. Convert to 1-based in main parser where line numbers are known. Cleaner separation.

Proceed with current design or fix position interface first?


# and also... quote stuff...

> if i need my nodejs code to support escaping and unescaping in quoted stirngs, how should i do that? does node hav ebulit in tool?  should i use custom regex?  use a 3rd party library? wdyt?  check online

I'll search for current best practices for string escaping/unescaping in Node.js.

Let me search for more specific Node.js escaping solutions:

Based on my research, here's what you should know about string escaping/unescaping in Node.js:

## Built-in Options

Node.js provides several built-in methods for string escaping:

1. **JSON.stringify()** - converts a JavaScript value to a JSON string, automatically escaping quotes and special characters
2. **querystring.escape()** - performs URL percent-encoding on the given str in a manner that is optimized for the specific requirements of URL query strings
3. **encodeURIComponent()** - for URL encoding

## For Quote Escaping Specifically

Your best options depend on the use case:

**For JSON data:**
```javascript
// Automatic escaping
const escaped = JSON.stringify(yourString);
// To get back original
const unescaped = JSON.parse(escaped);
```

**For manual escaping in JavaScript strings:**
```javascript
// Simple replace approach
const escapeQuotes = (str) => str.replace(/"/g, '\\"');
const unescapeQuotes = (str) => str.replace(/\\"/g, '"');
```

**For complex patterns:**
Custom regex is viable but error-prone. Consider these patterns:
- Escape: `/([\\"])/g` → `\\$1`
- Handle both single and double: `/(['"])/g`

## Third-Party Libraries

The npm package `escape-quotes` exists but hasn't been updated in 9 years. Most modern use cases don't need external libraries.

## Recommendation

1. **Use JSON.stringify()** if you're dealing with JSON data - it's robust and handles edge cases
2. **Use simple replace()** for basic quote escaping in strings
3. **Avoid deprecated escape()/unescape()** functions
4. **Consider the context** - HTML escaping, URL encoding, and JSON escaping all have different requirements

The key trade-off: built-in methods are safer but less flexible; custom regex gives control but requires careful testing for edge cases (nested quotes, already-escaped content, etc.).

------------

so should we really use a regex for strign parsing?  

why not one of these thigns?


1. **Use JSON.stringify()** if you're dealing with JSON data - it's robust and handles edge cases
2. **Use simple replace()** for basic quote escaping in strings


#####################

## Critical Issues

### 1. Regex Character Class Bug
```javascript
// This is broken in validateKey:
if (!KEY_CHARS_PATTERN.test(key)) {
```
The pattern `/^[\p{L}\p{N}_]*$/u` only matches if the ENTIRE string is valid. But we're testing individual characters in `findInvalidCharPosition`. This will always fail for strings longer than 1 character.

**Fix needed**: Either test the whole key or create a single-char pattern.

### 2. Assignment Parser Logic Flaw
```javascript
// Current code assumes afterEqual.endsWith('"')
if (!afterEqual.endsWith('"') || afterEqual.length === 1) {
```
This breaks for valid input like `key = "value" ` (trailing space). The integration tests expect this to work.

### 3. Position Calculation Inconsistency
The `findInvalidCharPosition` returns 0-based positions but error messages say "position 4" (1-based). This creates off-by-one errors in user-facing messages.

### 4. Missing Error Codes
Integration tests expect error codes like `INVALID_ASSIGNMENT_OPERATOR` but we're mapping `INVALID_OPERATOR` → `INVALID_ASSIGNMENT_OPERATOR` in the parser. Why not use consistent codes throughout?

### 5. Heredoc Delimiter Validation Too Strict
The validator requires exactly `EOT_SHAM_${blockId}` but integration tests show examples where content legitimately contains this delimiter. The spec says to use a different block ID in such cases, but our validator doesn't provide that flexibility.

## Architectural Concerns

1. **Error recovery strategy unclear** - When we hit `MISMATCHED_END`, we close the block anyway. But for `UNCLOSED_QUOTE`, we skip the line. No consistent principle.

2. **Unicode handling untested** - We're using `\p{L}` patterns but haven't verified Node.js version compatibility or tested with actual Unicode.

3. **Performance** - Creating regex objects repeatedly in loops. Should cache or restructure.

## Verdict

Not ready. The regex bug alone will cause most key validations to fail. Need fixes for at least issues 1-3 before this can work.


stuff above here maybe fixed already ^
_________________________________________


2. Position Tracking

Issue: Mixed 0-based/1-based indices, line numbers vs char positions
Decision: Use 0-based internally, convert to 1-based only at error reporting boundary
Implementation: parseAssignment returns 0-based positions; main parser adds 1 when creating errors

Position tracking - still mixing trimmed/untrimmed logic



3. Position tracking - NOT RESOLVED
Current issue: Still calculating positions after trimming
javascriptconst afterEqual = line.substring(equalIndex + 1).trim();
// Later trying to find position in original line
Fix needed: Track positions before any string manipulation
javascriptconst equalIndex = line.indexOf('=');
const afterEqual = line.substring(equalIndex + 1);
const firstQuotePos = afterEqual.indexOf('"');
const actualPosition = equalIndex + 1 + firstQuotePos; // Position in original line
Remaining complexity: Error at "value start" vs "invalid char" vs "unclosed quote" need different position calculations. Each error type needs explicit position logic.
The position tracking isn't conceptually hard, just tedious bookkeeping.


thsi might have been fixed already , idk

-----------------------

overhaul tests:  

Yes! Vitest absolutely supports dynamic test creation. In fact, it's even better at it than Mocha because it's more modern.

## Vitest Dynamic Tests

```javascript
// tests/integration.test.js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { parseSHAM } from '../dist/parser';

describe('SHAM Parser Integration Tests', () => {
  const mdContent = readFileSync('../sham-shared/sham-test/integration.md', 'utf8');
  const testCases = parseMarkdownToTests(mdContent);
  
  testCases.forEach(testCase => {
    it(testCase.id, () => {
      const result = parseSHAM(testCase.sham);
      expect(result.blocks).toHaveLength(testCase.expected.blocks.length);
    });
  });
});
```

## Running Specific Tests in Vitest

```bash
# Run single test
vitest --run -t "005-duplicate-key"

# Run tests matching pattern
vitest --run -t "duplicate"

# Interactive mode (REALLY nice!)
vitest --ui

# Run only tests in specific file
vitest integration.test.js

# Run with pattern
vitest --run --testNamePattern="error"
```

## Vitest Advantages

1. **Better filtering**: `-t` flag is simpler than `--grep`
2. **UI mode**: `vitest --ui` gives you a browser UI to select tests
3. **Watch mode**: Automatically reruns tests when files change
4. **Native TypeScript**: No compilation step needed
5. **Faster**: Runs tests in parallel by default

## Vitest-Specific Features

```javascript
// You can even use test.each for cleaner dynamic tests
import { test } from 'vitest';

const testCases = parseMarkdownToTests(mdContent);

test.each(testCases)('$id', ({ sham, expected }) => {
  const result = parseSHAM(sham);
  expect(result.blocks).toHaveLength(expected.blocks.length);
});
```

This gives even better test output and filtering.

So yes, Vitest not only supports it but makes it easier than Mocha!

in .md test case files, tests are grouped into groups with '## ' headings

eg:

```md

## general

### 001-empty-file

```sh sham
```

```json
{
  "blocks": [],
  "errors": []
}
```

### 002-single-block-basic

```sh sham
#!SHAM [@three-char-SHA-256: abc]
path = "/tmp/test.txt"
name = "example"
#!END_SHAM_abc
```

```json
{
  "blocks": [{
    "id": "abc",
    "properties": {
      "path": "/tmp/test.txt",
      "name": "example"
    },
    "startLine": 1,
    "endLine": 4
  }],
  "errors": []
}
```


#########################################


## JSON Test Format

Each function gets a `.json` file with consistent structure:

```json
{
  "function": "validateBlockId",
  "tests": [
    {
      "name": "valid-3-char",
      "input": ["abc"],
      "expected": {"valid": true}
    },
    {
      "name": "invalid-special-char",
      "input": ["a-b"],
      "expected": {
        "valid": false,
        "error": "Block ID must contain only alphanumeric characters"
      }
    }
  ]
}
```

## Key Decisions

1. **`input` is always an array** - even for single parameters. Consistent parsing.

2. **Types preserved** - `"2"` is string, `2` is number, `null` is null

3. **Regex patterns as objects**:
```json
{
  "name": "find-pattern",
  "input": ["line text", {"regex": "^[A-Z]+", "flags": "g"}],
  "expected": {"position": 0, "length": 3}
}
```

4. **Multiline strings use array**:
```json
{
  "name": "heredoc-content",
  "input": [["line 1", "line 2", "line 3"]],
  "expected": "line 1\nline 2\nline 3"
}
```

## getContextWindow exception - use markdown 

except for `getContextWindow`, use markdown.  since its input multiline string, one or two numeric inputs, and then the output is also multiline string. 

getContextWindow test files uses Markdown. Convention:

Each fenced block maps to a function parameter in order
Last fenced block contains expected JSON output
Line-based inputs (like getContextWindow) split on newlines

---

# testing approach update:

## Test Structure Proposal

### JSON Format with Groups

```json
{
  "function": "validateBlockId",
  "groups": [
    {
      "name": "valid-ids",
      "tests": [
        {
          "name": "3-alphanumeric",
          "input": ["abc"],
          "expected": {"valid": true}
        }
      ]
    },
    {
      "name": "invalid-length",
      "tests": [
        {
          "name": "too-short",
          "input": ["ab"],
          "expected": {
            "valid": false,
            "error": "Block ID must be exactly 3 characters"
          }
        }
      ]
    }
  ]
}
```

This enables `describe.each` in Vitest for clean group organization.

## Critical Questions After Re-reading

1. **Position tracking ambiguity**: The parser returns 1-based positions in errors, but internally uses 0-based. The conversion happens in `parseSHAM`. Unit tests for individual functions should test their ACTUAL return values (0-based), not the final output.

2. **Unicode complexity**: `findInvalidCharPosition` checks character-by-character with regex. This is inefficient and could fail with combining characters. Should test:
   - `"é"` (composed) vs `"é"` (decomposed) 
   - Surrogate pairs
   - The regex `/[\p{L}_]/u` might not behave identically across Node versions

3. **parseAssignment scope**: It handles 6 error types AND does partial parsing (finding quotes, heredoc markers). This violates single responsibility. But since it exists, test groups could be:
   - `malformed` (no =)
   - `empty-key` 
   - `invalid-operator` (:=, ::, =>)
   - `quoted-values` (valid, unclosed, trailing content)
   - `heredoc` (valid format)
   - `invalid-value` (unquoted, etc)

4. **getContextWindow edge cases**: 
   - File with fewer than 5 lines
   - Target line at boundaries
   - Empty files
   - Files without newlines

## Concrete Decisions Needed

1. **Test file naming**: 
   - Option A: `validateBlockId.test.json`
   - Option B: `validateBlockId.json` (simpler)

2. **Expected error format**: Should match actual function output exactly. For example, `validateBlockId` returns `{valid: false, error: "..."}`, not parser error objects.

3. **Regex patterns in JSON**: Still use `{"regex": "pattern", "flags": "u"}` format, but most functions don't need this.

4. **Character vs byte positions**: Current code uses character positions. Tests should verify this is consistent, especially for multi-byte UTF-8.


---

note, a lot of the above issues have already been resolved


remember that error codes and messages in the integration.md test cases are just suggestions.  they are liable to change and probably should change as we build out the parser and see what actually makes sense