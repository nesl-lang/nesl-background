import { describe, it, expect } from 'vitest';
import { parseSHAM } from '../../src/parser';
import type { ParseResult } from '../../src/types';

describe('parseSHAM unit tests', () => {
  it('should correctly parse test case 007 (heredoc-after-valid-end)', () => {
    const input = `#!SHAM [@three-char-SHA-256: col]
content = <<'EOT_SHAM_col'
This line is fine
EOT_SHAM_col
This breaks parsing
EOT_SHAM_col
#!END_SHAM_col`;

    const expected: ParseResult = {
      blocks: [{
        id: 'col',
        properties: {
          content: 'This line is fine'
        },
        startLine: 1,
        endLine: 7
      }],
      errors: [{
        code: 'MALFORMED_ASSIGNMENT',
        line: 5,
        column: 1,
        length: 19,
        blockId: 'col',
        content: 'This breaks parsing',
        context: "This line is fine\nEOT_SHAM_col\nThis breaks parsing\nEOT_SHAM_col\n#!END_SHAM_col",
        message: "Invalid line format in block 'col': not a valid key-value assignment or empty line"
      }, {
        code: 'MALFORMED_ASSIGNMENT',
        line: 6,
        column: 1,
        length: 12,
        blockId: 'col',
        content: 'EOT_SHAM_col',
        context: "This line is fine\nEOT_SHAM_col\nThis breaks parsing\nEOT_SHAM_col\n#!END_SHAM_col",
        message: "Invalid line format in block 'col': not a valid key-value assignment or empty line"
      }]
    };

    const result = parseSHAM(input);
    expect(result).toEqual(expected);
  });
});