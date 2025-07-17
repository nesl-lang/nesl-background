....

These changes make the code self-documenting by:
1. Renaming `currentBlockStart` → `currentBlockMarkerLine` 
2. Renaming `currentBlockLines` → `currentBlockContentLines`
3. Renaming `lineNum` → `fileLineNumber`
4. Adding explicit comments about the +1 offset in `getLineNumber`
5. Updating documentation to be unambiguous


feel good about all this?



Not entirely. Looking at the test data more carefully:

**Test `002_multiple_blocks.json` expects:**
- Block 1: `startLine: 1` 
- Block 2: `startLine: 11`
- Block 3: `startLine: 19`

**The actual file lines:**
```
Line 1: <<<<<<<<<nesl    (first marker)
Line 11: <<<<<<<<<nesl   (second marker) 
Line 19: <<<<<<<<<nesl   (third marker)
```

So the tests DO expect `startLine` to be the marker line. But there's a problem with my proposed fix.

In `block-parser.test.ts`, it does:
```typescript
const result = parseBlock(block.content, block.startLine, fileLines, config);
```

And in `block-parser.ts`, the error context uses:
```typescript
context: getContext(fileLines, fileLine - 1) // Convert to 0-based index
```

This means `parseBlock` expects to receive the marker line and adds 1 internally to get to content lines. That's actually correct.

**The real issue:** The tests pass `fileLines` (the full file) to `parseBlock`, but `parseBlock` is calculating line numbers assuming `startLine` is where content begins, not where the marker is.

Actually, wait. Let me trace through test `001_invalid_key_recovery`:
- Marker at line 1
- First content line `{` at line 2
- Error line `bad key = ...` at line 4

The test expects error at line 4. With current code:
- `startLine` = 2 (after my fix it would be 1)
- Content line index = 2 (third line of content)
- Calculated: 2 + 2 = 4 ✓ (or with fix: 1 + 2 + 1 = 4 ✓)

So both approaches could work, but we need consistency. The architecture doc fragment I wrote assumes `startLine` is the marker line, which matches the test expectations.

I feel good about the variable renaming for clarity, but we should run the tests to verify the line number calculations are correct after these changes.