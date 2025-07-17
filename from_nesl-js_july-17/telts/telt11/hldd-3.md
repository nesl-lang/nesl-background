# TELT Parser Design Document

https://chatgpt.com/c/68746c70-f3b0-800c-bc8d-cb949587a8ad
https://claude.ai/chat/7649136f-13fc-495f-95f6-446a13fee7d5

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

| State         | Valid Line Types                     |
| ------------- | ------------------------------------ |
| `OUTSIDE`     | BLOCK\_START                         |
| `IN_BLOCK`    | SECTION\_START                       |
| `IN_SECTION`  | PROPERTY\_START, BLOCK\_END          |
| `IN_PROPERTY` | CONTENT, PROPERTY\_START, BLOCK\_END |

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

  // Validate marker overlap
  const exampleLines = [
    config.BLOCK_START,
    config.SECTION_START + 'X' + config.SECTION_END,
    config.PROP_START + 'X' + config.PROP_HASH_PREFIX + 'abc' + config.PROP_HASH_SUFFIX + config.PROP_END,
    config.BLOCK_END_START + config.BLOCK_END_CONTENT + config.BLOCK_END_SEP + 'abc' + config.BLOCK_END_END
  ];

  for (let i = 0; i < exampleLines.length; i++) {
    for (let j = 0; j < exampleLines.length; j++) {
      if (i !== j && exampleLines[j].startsWith(exampleLines[i])) {
        throw new Error(`Ambiguous line marker: "${exampleLines[i]}" is a prefix of "${exampleLines[j]}"`);
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
* Config validation is overly strict—rejects valid configurations where delimiters are reused across line types even when patterns remain distinguishable by regex

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
  "config": {
    "file:type": "application/json",
    "version-tag": "v1.2.3"
  }
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
  "deploy:settings": {
    "target-env": "production",
    "retry-count": "3",
    "build:hash": "x89a3bc"
  }
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
  "meta": {
    "author": ["Jane Doe", "John Smith"]
  },
  "data:body": {
    "description": "This block contains\na multiline description\nwith three lines.",
    "notes": "- point one\n- point two"
  }
}
```



  // Validate marker overlap by checking if example lines could prefix each other
  // NOTE: This is stricter than necessary (prevents some valid configs where patterns
  // are regex-distinguishable), but catches genuinely confusing configurations early