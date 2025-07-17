import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { getContextWindow } from '../../src/utils/getContextWindow';

const testPath = join(__dirname, '../../sham-shared/sham-test/unit/getContextWindow.test.md');
const mdContent = readFileSync(testPath, 'utf8');

const tokens = marked.lexer(mdContent);
const codeBlocks = tokens.filter(t => t.type === 'code' && t.lang === 'text');
const testNames = tokens.filter(t => t.type === 'heading' && t.depth === 3).map(t => t.text);

describe('getContextWindow', () => {
  testNames.forEach((name, i) => {
    const baseIndex = i * 3;
    it(name, () => {
      const input = codeBlocks[baseIndex].text;
      const targetLine = parseInt(codeBlocks[baseIndex + 1].text.trim());
      const expected = codeBlocks[baseIndex + 2].text;
      const result = getContextWindow(input, targetLine);
      expect(result).toEqual(expected);
    });
  });
});