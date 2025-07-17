## Unresolved Uncertainties & Executive Decisions

### 1. **File architecture: Modular vs Monolithic**
**Decision**: 6-7 files with clear boundaries.

**Rationale**: State machine implementations benefit from clear separation. The test suite shows distinct concerns: block extraction, state transitions, string parsing, error formatting.

```
src/
  parser.ts         (~150) - Public API, orchestrates passes
  block-extractor.ts (~100) - Isolates NESL blocks  
  state-machine.ts   (~300) - Core parsing logic
  string-parser.ts   (~150) - R"""pv()pv""" algorithm
  errors.ts          (~200) - Error types, formatting, context
  types.ts           (~100) - Interfaces, constants
  index.ts           (~20)
```

### 2. **State machine implementation**
**Decision**: Class-based with explicit state enum.

**Rationale**: Object-oriented state machines provide better encapsulation for state-specific data. Need to track multiline accumulation, current key, etc.

```typescript
enum State { OBJECT, ARRAY, MULTILINE }
class StateMachine {
  private state: State
  private multilineAccumulator: string[]
  private currentKey?: string
}
```

### 3. **Error recovery mechanism**
**Decision**: Try-catch per line with error accumulation.

**Rationale**: Tests show multiple recoverable errors must be collected. Structured error handling with consistent error types enables this pattern.

### 4. **String parsing algorithm**
**Decision**: Two-pass scan - first validate, then extract.

```typescript
function parseString(line: string): string | ParseError {
  const startIdx = line.indexOf('R"""pv(');
  if (startIdx === -1) return error;
  
  const lastEndIdx = line.lastIndexOf(')pv"""');
  if (lastEndIdx === -1) return error;
  
  // Validate no content after
  const afterEnd = line.slice(lastEndIdx + 6);
  if (afterEnd.trim()) return error;
  
  return line.slice(startIdx + 7, lastEndIdx);
}
```

### 5. **Line buffer management**
**Decision**: Rolling 3-line window for context.

**Rationale**: Error context needs previous/current/next. Memory efficient vs keeping all lines.

### 6. **Block delimiter customization**
**Decision**: Pass markers as options, use throughout.

```typescript
interface ParseOptions {
  stringOpen?: string   // default: 'R"""pv('
  stringClose?: string  // default: ')pv"""'
  blockStart?: string   // default: '<<<<<<<<<nesl'
  blockEnd?: string     // default: '=========nesl'
}
```

### 7. **EOF handling**
**Decision**: Explicit EOF state check after processing.

**Rationale**: Tests show `eof_unexpected` error. Need post-loop validation.

## Reflection on Decisions

The modular approach (6-7 files) balances testability with cohesion. State machines with 200 lines can handle complex parsing, but NESL's error requirements push complexity higher.

Key insight: Error handling drives architecture more than parsing complexity. Each error type needs:
- Detection logic (scattered across states)
- Context generation (line buffer access)
- Recovery decision (fatal vs continue)

The state machine pattern fits well because:
1. Line-oriented parsing maps naturally to state transitions
2. Context-sensitive validation (assignments only in OBJECT)
3. Clear success/failure states

## Remaining Uncertainties

1. **Performance**: String parsing with multiple `indexOf` vs single scan? Profile needed.
2. **Memory**: Keep all lines for error context or sliding window? Depends on typical file size.
3. **Streaming**: Current design assumes full file in memory. Stream processing would require buffering strategy.

## Final Architecture Summary

**Total LOC**: ~1000-1200 across 6-7 files

**Core patterns**:
- Two-pass parsing (block extraction → NESL parsing)
- State machine with explicit states and transitions
- Error accumulation with structured types
- Direct JSON output (no intermediate AST)

**Complexity centers**:
- String parsing: Multiple delimiters on one line
- Error context: Line number translation between passes
- State validation: Context-specific rules

This design prioritizes debuggability and error quality over minimal code size. The modular structure enables unit testing each component in isolation.

>re "Remaining Uncertainties" none of those things really matter.  input files will never be that big.

>wdyt?  feel good abtout this latest development plan?  any necesary adjustments?

Looking at the architecture, I see a potential issue: the 6-7 file split might be premature optimization. 

**Core concern**: The state machine and string parser are tightly coupled - the state machine needs to call string parsing for every value assignment. Separating them means exposing internal parsing details across module boundaries.

**Alternative**: Collapse to 4 files:
```
src/
  parser.ts       (~500) - API, block extraction, state machine, string parsing
  errors.ts       (~200) - Error classes, formatting, context generation  
  types.ts        (~100) - All interfaces, enums, constants
  index.ts
```

**Rationale**: 
- Block extraction is ~50 lines max (regex match + loop)
- String parsing is one function (~30 lines)
- State machine needs intimate knowledge of both
- Less module overhead, easier to trace execution

**Other adjustments**:

1. **Error recovery is underspecified** - which errors are actually recoverable? The spec says "skip line" but that breaks structure tracking. Need explicit list:
   - `invalid_key` - skip assignment, continue
   - `string_unterminated` - skip line, continue
   - `content_after_string` - skip line, continue
   - Everything else - fatal

2. **State tracking complexity** - multiline blocks need:
   - Current accumulator
   - Opening line number (for error reporting)
   - Parent context (object key waiting for value)

3. **The "multiple delimiters per line" edge case** - test shows `R"""pv(first)pv""" R"""pv(second)pv"""` → `"first)pv""" R"""pv(second"`. This violates the spec's "find LAST occurrence" rule. Need clarification or accept test behavior.

Feel good about: state machine pattern, error context generation, two-pass approach.

Still fuzzy: exact error recovery semantics, whether custom delimiters add complexity (probably 50+ lines for proper escaping).

> what should we do next?  keep designing? start wriitng/building?



Start building. The design is sufficient to expose real issues that speculation won't catch.

**Build order**:
1. `types.ts` - Lock down interfaces, drives everything else
2. String parser function - Most self-contained, testable in isolation
3. State machine with simplest rules - Just parse `{key = R"""pv(value)pv"""}` 
4. Add complexity incrementally - Arrays, multiline, nested structures
5. Error handling last - Easier to add once happy path works

**Critical unknowns to test early**:

1. **String parsing edge case** - Implement the "find LAST `)pv"""`" algorithm and test against `008_multiple_delimiters_one_line`. The test expects behavior that contradicts the spec. This needs resolution.

2. **State machine granularity** - Start with function-per-state or switch statement? The function approach enables easier testing but adds boilerplate.

3. **Error context building** - The "line before/after" requirement means buffering lines. Test with first error case to see if the approach scales.

**First test case to implement**: `core/001_basic_strings` - Forces string parser + basic object structure without nesting complexity.

**Architecture decision to defer**: Whether block extraction lives in parser.ts or separate file. Will be obvious after implementing.

The spec ambiguities (EOF handling, exact recoverable errors) will resolve themselves when you hit the test cases.

>r u sure about this?  look closely at the docs


>   ```
    String parsing edge case - Implement the "find LAST )pv"""" algorithm and test against 008_multiple_delimiters_one_line. The test expects behavior that contradicts the spec. This needs resolution.
    ```

You're right. Looking at the test case:

```nesl
multiple_markers = R"""pv(first)pv""" R"""pv(second)pv"""
```

Expected output:
```json
"multiple_markers": "first)pv\"\"\" R\"\"\"pv(second"
```

This follows the spec exactly: "find LAST occurrence of `)pv"""` on the line". The last `)pv"""` is at the very end, so everything between the first `R"""pv(` and that last `)pv"""` becomes the string value.

The spec is clear. No contradiction. My error.

This actually makes the string parser simpler - just find first `R"""pv(`, find last `)pv"""`, extract everything between. The edge case is handled by the algorithm itself.

Ready to build?