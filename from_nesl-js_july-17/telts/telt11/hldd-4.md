# TELT Parser Design Document

https://chatgpt.com/c/68746c70-f3b0-800c-bc8d-cb949587a8ad
https://claude.ai/chat/7649136f-13fc-495f-95f6-446a13fee7d5
https://claude.ai/chat/3e472365-d8cf-47a2-b071-9108e7935497
https://claude.ai/chat/a912bfc0-6602-47f2-a447-523720577dda

## Overview

TELT (Text Encoding for Language-model Tasks) is a line-based format for encoding structured text data in a way that is easy to parse, human-readable, and adaptable to syntax experimentation. The TELT parser converts TELT blocks into structured JSON while providing robust error diagnostics. The parser is configurable to support different delimiter styles, enabling research into optimal syntaxes for language models.

## Key Principles

* **Line-oriented**: Each line is parsed as a complete unit.
* **Context-sensitive**: The parser uses a state machine to interpret lines based on current parse context.
* **Configurable**: All delimiters and syntax markers are user-definable.
* **Unambiguous**: Full line patterns must be distinguishable based on state and regex.

---

## TELT Syntax Overview

```telt
#!telt [block hash: xyz]            # Block start
=== SECTION_NAME ===                # Section start
--PROPERTY-ONE xyz--                # Property 1
value for property one
spans multiple lines
--PROPERTY:TWO xyz--                # Property 2 - ends PROPERTY_ONE and starts PROPERTY_TWO
...
--END xyz--                         # Ends the entire block
```

### Notes:

* Each `--PROPERTY_NAME xyz--` starts a new property within the section.
* A **single** `--END xyz--` ends the entire TELT block.
* Property boundaries are determined by the start of the next property or the block end.
* Only one `--END hash--` is used per block, regardless of the number of sections or properties.

---

## Parsing Rules

### General Constraints

* **Property and section names** must match the pattern:
  `/^[a-zA-Z_][a-zA-Z0-9_:\-]*$/`

  That is:

  * Names may start with any letter (uppercase or lowercase) or underscore (`_`)
  * Allowed characters: letters, digits, underscores (`_`), colons (`:`), and hyphens (`-`)
  * **No whitespace** allowed

* **Block hash** must match the pattern:
  `/^[a-z0-9]{1,50}$/`

  That is:

  * Must be between 1 and 50 characters
  * Allowed characters: lowercase letters (`a–z`) and digits (`0–9`)

* **Delimiters** must start at the beginning of a line (no leading whitespace)

* **Parser state** determines which line types are valid at any moment

---


### Parser States

| State         | Valid Line Types                                              |
| ------------- | ------------------------------------------------------------- |
| `OUTSIDE`     | BLOCK\_START                                                  |
| `IN_BLOCK`    | SECTION\_START                                                |
| `IN_SECTION`  | PROPERTY\_START, SECTION\_START, BLOCK\_END                   |
| `IN_PROPERTY` | CONTENT, PROPERTY\_START, SECTION\_START, BLOCK\_END          |

### Hash Validation Rules

* **Block hash** is declared in `BLOCK_START` and stored as parser context
* **All property hashes MUST match the block hash** - mismatch produces `HASH_MISMATCH` error
* **Section delimiters don't use hashes** - only properties and block end
* Parser continues on hash mismatch but marks block invalid in output

### Line Types (Determined by Regex + State)

* `BLOCK_START`: Starts a new block and declares the block hash
* `SECTION_START`: Declares a new section inside the block
* `PROPERTY_START`: Begins a property (name + hash)
* `BLOCK_END`: Closes current property or block
* `CONTENT`: Any line not matching other types

> **Note:** Sections are implicitly closed by the next `SECTION_START` or the block end.

---

## Configuration

```js
const defaultConfig = {
  BLOCK_START: '#!telt',
  HASH_DECL_START: ' [block hash: ',
  HASH_DECL_END: ']',
  SECTION_START: '=== ',
  SECTION_END: ' ===',
  PROP_START: '--',
  PROP_HASH_PREFIX: ' ',
  PROP_HASH_SUFFIX: '',
  PROP_END: '--',
  BLOCK_END_START: '--',
  BLOCK_END_CONTENT: 'END',
  BLOCK_END_SEP: ' ',
  BLOCK_END_END: '--'
};
```

---

## Parser Implementation

### 1. Config Validation

```js
function validateConfig(config) {
  const requiredMarkers = Object.values(config);
  for (const marker of requiredMarkers) {
    if (!marker) throw new Error(`Empty marker found in config`);
  }

  // Build patterns to test for conflicts
  const patterns = buildLinePatterns(config);
  
  // Test disambiguation in each valid state
  const testCases = [
    { state: 'IN_SECTION', patterns: ['propertyStart', 'sectionStart', 'blockEnd'] },
    { state: 'IN_PROPERTY', patterns: ['propertyStart', 'sectionStart', 'blockEnd'] }
  ];
  
  // Test actual patterns for conflicts
  for (const test of testCases) {
    const testStrings = {
      propertyStart: `${config.PROP_START}TEST${config.PROP_HASH_PREFIX}abc${config.PROP_HASH_SUFFIX}${config.PROP_END}`,
      sectionStart: `${config.SECTION_START}TEST${config.SECTION_END}`,
      blockEnd: `${config.BLOCK_END_START}${config.BLOCK_END_CONTENT}${config.BLOCK_END_SEP}abc${config.BLOCK_END_END}`
    };
    
    // Verify each test string matches exactly one pattern
    for (const [type1, str] of Object.entries(testStrings)) {
      if (!test.patterns.includes(type1)) continue;
      
      let matchCount = 0;
      for (const type2 of test.patterns) {
        if (patterns[type2].test(str)) {
          matchCount++;
          if (type1 !== type2) {
            throw new Error(`Pattern conflict: "${str}" matches both ${type1} and ${type2}`);
          }
        }
      }
      
      if (matchCount === 0) {
        throw new Error(`Pattern ${type1} fails to match its own test case: "${str}"`);
      }
    }
  }
}
```

### 2. Line Classifier (Regex-based)

```js
function buildLinePatterns(config) {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    blockStart: new RegExp(`^${esc(config.BLOCK_START)}${esc(config.HASH_DECL_START)}([a-z0-9]{1,50})${esc(config.HASH_DECL_END)}$`),
    sectionStart: new RegExp(
        `^${esc(config.SECTION_START)}([a-zA-Z_][a-zA-Z0-9_:\\-]*)${esc(config.SECTION_END)}$`
    ),
    propertyStart: new RegExp(
        `^${esc(config.PROP_START)}([a-zA-Z_][a-zA-Z0-9_:\\-]*)` +
        `${esc(config.PROP_HASH_PREFIX)}([a-z0-9]{1,50})` +
        `${esc(config.PROP_HASH_SUFFIX)}${esc(config.PROP_END)}$`
    ),

    blockEnd: new RegExp(`^${esc(config.BLOCK_END_START)}${esc(config.BLOCK_END_CONTENT)}${esc(config.BLOCK_END_SEP)}([a-z0-9]{1,50})${esc(config.BLOCK_END_END)}$`)
  };
}
```

### 3. Parser State Machine

* Maintain current state, section, and property buffer
* On each line:
  * Match against regexes
  * Depending on state, dispatch to appropriate handler
* Emit JSON objects with source line metadata and diagnostics

### Property Value Assembly

* Property values accumulate from content lines following `PROPERTY_START`
* Content lines joined with `\n` (newline character)
* Property ends when encountering: another `PROPERTY_START`, `SECTION_START`, or `BLOCK_END`
* Empty properties (no content lines) → empty string `""`
* Repeated property names within section → array of values
* Whitespace in content preserved exactly

---

## Output Format

### Successful Parse

```json
{
  "blocks": [
    {
      "hash": "abc",
      "start_line": 1,
      "end_line": 12,
      "sections": [
        {
          "name": "CREATE_FILE",
          "start_line": 3,
          "end_line": 10,
          "properties": {
            "FILE": "example.txt",
            "CONTENT": "Hello world"
          }
        }
      ]
    }
  ],
  "diagnostics": []
}
```

### Multiple Blocks

A file may contain multiple TELT blocks. The parser always returns a `blocks` array at the root level, even for single blocks.

### Multiple Sections Format

When a block contains multiple sections, they form an array in the output:

```json
{
  "blocks": [
    {
      "hash": "r3d",
      "sections": [
        {
          "name": "CREATE_FILE",
          "properties": { "FILE": "README.md", "CONTENT": "# Setup" }
        },
        {
          "name": "ADD_CONTENT", 
          "properties": { "FILE": "README.md", "CONTENT": "## Start" }
        }
      ]
    }
  ]
}
```

### Error Example

```json
{
  "diagnostics": [
    {
      "code": "HASH_MISMATCH",
      "message": "Expected hash 'abc' but found 'xyz'",
      "range": {
        "start": {"line": 10, "character": 0},
        "end": {"line": 10, "character": 15}
      }
    }
  ]
}
```

---

## Design Strengths

* **Flexible**: Works with any delimiter configuration that satisfies full-pattern uniqueness (e.g. `--SECTION xyz--` and `--PROPERTY xyz--` are fine as long as they're distinguishable in context)
* **Resilient**: Maintains internal state for contextual parsing
* **Debuggable**: Emits structured diagnostics
* **Readable**: Leverages line-based parsing and human-friendly syntax

---

## Known Limitations

* Unicode marker support not validated across regex engines
* No streaming/incremental support yet (file must be loaded into memory)
* Parser does not validate semantic structure of sections/properties
 

---

## Future Enhancements

1. Streaming + incremental parsing
2. Schema-based section/property validation
3. Syntax auto-tester for LLM compatibility experiments
4. Visualizer for block/section/property structure
5. Relax config validation to check actual regex conflicts instead of prefix-based string matching

---

## Conclusion

The revised TELT parser design embraces configurability without sacrificing reliability by grounding parsing in context-aware line classification. With proper config validation and full-pattern disambiguation, the parser enables robust structured parsing suitable for language model workflows, syntax experimentation, and code generation pipelines.

---

## 📎 Addendum: Clarifications and Final Decisions

### ✅ Line Pattern Disambiguation

* **Prefix uniqueness is not required.**
  All line types must be distinguishable via **full-pattern regex** classification in context.

* **State-based interpretation** ensures correctness even when multiple line types share prefixes (e.g., `--` for both section and property lines).

### ✅ Config Validation Enhancements

* **Full-pattern conflict detection** is now required.
  The parser must simulate or construct minimal example lines for each line type and verify that:

  * No pattern unintentionally matches another's structure
  * No line type can be misclassified in any valid parser state

* **Empty markers are disallowed** in config (e.g., no empty `PROP_END` or `BLOCK_END_SEP`).

### ✅ Error Handling & Diagnostics

* Lines that do not match any expected pattern for the current state will produce a `UNRECOGNIZED_LINE` diagnostic with `severity: "warning"`.

* Hash mismatches during property or block ends produce `HASH_MISMATCH` errors (`severity: "error"`).

* All diagnostics now include:

  ```json
  {
    "code": "HASH_MISMATCH",
    "message": "...",
    "severity": "error" | "warning",
    "range": { "start": { "line": X, "character": Y }, "end": { ... } }
  }
  ```

### ✅ Edge Case Semantics

* **Empty property content** (e.g., a property with `--NAME abc--` followed immediately by `--END abc--`) is allowed and interpreted as an empty string: `""`.

* **Repeated properties** within a section result in arrays of values:

  ```json
  {
    "TAGS": ["fast", "lightweight", "safe"]
  }
  ```

### ✅ ReDoS Safety

* TELT patterns must avoid complex nested regex.
  Use only simple, anchored, non-greedy expressions (`^...$`).


Here’s an **Addendum: TELT Syntax Examples** section, with 3 varied examples and their equivalent JSON to illustrate the supported syntax breadth.

---

## 📎 Addendum: TELT Syntax Examples & JSON Equivalents

### Example 1: Simple Block with Custom Property Names

```telt
#!telt [block hash: a1b]
=== config ===
--file:type a1b--
application/json
--version-tag a1b--
v1.2.3
--END a1b--
```

**JSON:**

```json
{
  "blocks": [
    {
      "hash": "a1b",
      "sections": [
        {
          "name": "config",
          "properties": {
            "file:type": "application/json",
            "version-tag": "v1.2.3"
          }
        }
      ]
    }
  ]
}
```

---

### Example 2: Section with Colons and Hyphens in Names

```telt
#!telt [block hash: z9k]
=== deploy:settings ===
--target-env z9k--
production
--retry-count z9k--
3
--build:hash z9k--
x89a3bc
--END z9k--
```

**JSON:**

```json
{
  "blocks": [
    {
      "hash": "z9k",
      "sections": [
        {
          "name": "deploy:settings",
          "properties": {
            "target-env": "production",
            "retry-count": "3",
            "build:hash": "x89a3bc"
          }
        }
      ]
    }
  ]
}
```

---

### Example 3: Multiple Sections, Repeated Properties, Multiline Values

```telt
#!telt [block hash: m5x]
=== meta ===
--author m5x--
Jane Doe
--author m5x--
John Smith

=== data:body ===
--description m5x--
This block contains
a multiline description
with three lines.
--notes m5x--
- point one
- point two
--END m5x--
```

**JSON:**

```json
{
  "blocks": [
    {
      "hash": "m5x",
      "sections": [
        {
          "name": "meta",
          "properties": {
            "author": ["Jane Doe", "John Smith"]
          }
        },
        {
          "name": "data:body",
          "properties": {
            "description": "This block contains\na multiline description\nwith three lines.",
            "notes": "- point one\n- point two"
          }
        }
      ]
    }
  ]
}
```



######################

## Problem 3: Config Validation Incomplete

The validation function contains:
```javascript
// TODO: Implement actual regex conflict detection
```

This isn't a minor detail - it's the core safety mechanism. The function:
1. Builds regex patterns
2. Maps pattern names
3. Then... nothing. Just a TODO.

Without actual conflict detection, invalid configs pass validation. Example: if `PROP_START` = `"--"` and `BLOCK_END_START` = `"--"`, the parser can't distinguish between `--PROPERTY abc--` and `--END abc--`.

The document claims "full-pattern conflict detection is now required" but doesn't implement it.


#########################

update:

```telt
#!telt [block hash: d4k]
=== environment ===
--name d4k--
production
--region d4k--
us-east-1
--tier d4k--
premium
END d4k

#!telt [block hash: j8m]
=== config ===
--port j8m--
8080
--workers j8m--
4
END j8m
```

Without delimiters feels most natural. Just `END hash`.

Why:
- Properties need delimiters to distinguish name from value
- END doesn't - it's a pure keyword
- Less visual noise
- Matches how I naturally write: properties are "contained", keywords are "bare"

The pattern: **data needs delimiters, control doesn't**.

Properties are data. END is control flow.

> feel good about this?

Yes. `END hash` without delimiters feels right.

Testing this against LLM generation patterns:
- Properties establish `--X hash--` pattern 
- END breaks pattern but in a predictable way
- Single keyword, no delimiter matching
- Visually distinct from data lines

The asymmetry (delimited properties, bare END) actually helps. It signals "this line is different" without requiring mental mode switch to new syntax.

Potential issue: if blocks can be nested or if END can appear mid-block for some reason. But given your examples, seems like flat structure with END as true terminator.

This feels like the minimal cognitive load solution. Write properties with delimiters, write END without. Simple rule.

################################

notes.  so we need a parser than can be super flexible.  

we need to support this:


const defaultConfig = {
  BLOCK_START: '#!telt',
  HASH_DECL_START: ' [block hash: ',
  HASH_DECL_END: ']',
  SECTION_START: '=== ',
  SECTION_END: ' ===',
  PROP_START: '--',
  PROP_HASH_PREFIX: ' ',
  PROP_HASH_SUFFIX: '',
  PROP_END: '--',
  BLOCK_END_START: '--',
  BLOCK_END_CONTENT: 'END',
  BLOCK_END_SEP: ' ',
  BLOCK_END_END: '--'
};

but it should also support htis:

(section and prop markers the same
)
const defaultConfig = {
  BLOCK_START: '#!telt',
  HASH_DECL_START: ' [block hash: ',
  HASH_DECL_END: ']',
  SECTION_START: '--',
  SECTION_END: '--',
  PROP_START: '--',
  PROP_HASH_PREFIX: ' ',
  PROP_HASH_SUFFIX: '',
  PROP_END: '--',
  BLOCK_END_START: '--',
  BLOCK_END_CONTENT: 'END',
  BLOCK_END_SEP: ' ',
  BLOCK_END_END: '--'
};
and this:



const defaultConfig = {
  BLOCK_START: '#!telt',
  HASH_DECL_START: ' [block hash: ',
  HASH_DECL_END: ']',
  SECTION_START: '--',
  SECTION_END: '--',
  PROP_START: '--',
  PROP_HASH_PREFIX: ' ',
  PROP_HASH_SUFFIX: '',
  PROP_END: '--',
  BLOCK_END_START: '',
  BLOCK_END_CONTENT: 'END',
  BLOCK_END_SEP: ' ',
  BLOCK_END_END: ''
};

and we need the parser to not worry about the edge case where a property is named "END".  if that's the case, then the block will terminate at that "property" start line and the remaining lines will be ignored as unrelated text in the file.  hopefully the user notices the missing content that he expects. 

we need to be able to parse lines that allow these different syntax scenarios.  needs to be highly context depenedent.  based on state machine state. 