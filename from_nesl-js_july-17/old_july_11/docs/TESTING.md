# NESL Parser Testing

Test suite for NESL parser implementations. All parsers must produce identical output for all test cases.

TDD development - red/green/refactor

## Structure

```
nesl-test/
├── tests/
│   ├── integration/    # Full parser tests
│   └── unit/          # Component tests
```

Test pairs: `*.nesl` (input) + `*.json` (expected output)

## Integration

Add as git submodule:
```bash
git submodule add https://github.com/nesl-lang/nesl-test.git
```

## Output Format

### Success
Array of parsed values (one per block):
```json
[{"key": "value"}, {"another": "block"}]
```

### Errors
Object with errors array:
```json
{
  "errors": [{
    "line": 3,
    "code": "string_unterminated",
    "message": "String literal starting with R\"\"\"pv( was not closed with )pv\"\"\" on the same line",
    "content": "  bad = R\"\"\"pv(never ends",
    "context": "  good = R\"\"\"pv(ok)pv\"\"\"\n  bad = R\"\"\"pv(never ends\n  next = R\"\"\"pv(unreachable)pv\"\"\""
  }]
}
```

### Mixed Success/Error
- **Duplicate keys**: Parser continues, uses last value, reports non-fatal error
- **Fatal errors**: Stop parsing current structure, attempt recovery in parent
- **Multiple blocks**: If ANY block has errors, return only errors (no data array)

## Implementation Notes

- Files without block wrappers should error immediately with `missing_block_wrapper`
- Test discovery should preserve directory structure in test names
- Compare parsed JSON objects, not string representations

## Requirements

1. **Exact matching**: All fields, messages, and context must match character-for-character
2. **Line numbers**: File-relative, 1-based
3. **Context**: 5-line window (target line centered when possible)
4. **Line endings**: Normalize to `\n`
5. **No additional fields**: Output only specified fields

## Custom Syntax

Tests with `"config"` field use custom delimiters:
```json
{
  "config": {
    "stringOpen": "%%%[",
    "stringClose": "]%%%"
  },
  "blocks": [...]
}
```

## Running Tests

Implement test runner that:
1. Discovers all `*.nesl` files recursively
2. Parses with appropriate config
3. Compares actual vs expected JSON
4. Reports failures with diffs

Language-specific examples:
- **JavaScript**: Use vitest/jest with `toEqual`
- **Python**: Use pytest with `assert json.loads(actual) == expected`
- **Rust**: Use serde_json for comparison

## Edge Cases

- **EOF errors**: Use empty string for `content`, last 5 lines for `context`
- **Block extraction errors**: May have different context format
- **Unicode**: No normalization - compare raw bytes
- **Timeout**: Tests should complete in <100ms each

## Maintenance

Never edit test files locally. To update:
1. PR to `nesl-test` repository
2. Update submodule: `git submodule update --remote`