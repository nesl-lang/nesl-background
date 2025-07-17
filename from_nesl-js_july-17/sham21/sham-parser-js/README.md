# SHAM Parser for JavaScript

JavaScript parser implementation for the SHAM (Structured Hashed-marker) format.

## Installation

```bash
npm install sham-parser-js
```

## Usage

```javascript
import { parseSHAM } from 'sham-parser-js';

const result = parseSHAM(shamContent);
console.log(result.blocks);
console.log(result.errors);
```

## Position Encoding

This parser uses **UTF-16 code unit** positions for all column offsets, matching JavaScript's native string handling and the Language Server Protocol (LSP) specification.

### What this means:
- Characters in the Basic Multilingual Plane (BMP) count as 1 position
- Characters outside BMP (e.g., emoji 😀) count as 2 positions
- Column positions in error messages are 1-based for display
- Internal calculations use 0-based indices

### Example:
```
"key = "👨‍👩‍👧‍👦""
```
The family emoji has `.length` of 11 in JavaScript, so the closing quote is at column 12 (1-based).

## Development

```bash
npm run build       # Compile TypeScript
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode
```

## Error Reporting

Errors include:
- `line`: 1-based line number
- `column`: 1-based UTF-16 column position
- `length`: Error span length in UTF-16 code units
- `message`: Human-readable error description
- `context`: 5-line window around the error

## Character Encoding

This parser uses UTF-16 code unit positions for all offsets, matching:
- JavaScript's internal string representation
- Language Server Protocol (LSP) default encoding
- Standard JavaScript string methods (.length, .charAt, etc.)

### Implications:
- Characters in Basic Multilingual Plane = 1 position
- Characters outside BMP (e.g., 😀) = 2 positions  
- All error positions report UTF-16 code units, not Unicode code points