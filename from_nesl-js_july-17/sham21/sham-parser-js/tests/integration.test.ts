import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { parseSHAM } from '../src/parser';

const testPath = join(__dirname, '../sham-shared/sham-test/integration.md');



// // --- NEW DIAGNOSTIC LINE ---
// console.log('<<<<<<<<<< ATTEMPTING TO READ TEST FILE FROM THIS ABSOLUTE PATH: >>>>>>>>>>');
// console.log(testPath);
// console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');



const mdContent = readFileSync(testPath, 'utf8');

const tokens = marked.lexer(mdContent);
const codeBlocks = tokens.filter(t => t.type === 'code');
const testNames = tokens.filter(t => t.type === 'heading' && t.depth === 3).map(t => t.text);

// ... imports

describe('SHAM Parser Integration Tests', () => {
  testNames.forEach((name, i) => {
    const baseIndex = i * 2;
    it(name, () => {
      const input = codeBlocks[baseIndex].text;
      const expected = JSON.parse(codeBlocks[baseIndex + 1].text);
      const result = parseSHAM(input);

      // // --- DIAGNOSTIC LOG ---
      // // Log the content of the expected object for our specific failing test
      // if (name === '007-heredoc-after-valid-end') {
      //   console.log('--- DIAGNOSTIC: The "expected" object being used by the test:');
      //   console.log(JSON.stringify(expected, null, 2));
      //   console.log('-----------------------------------------------------------');
      // }
      // // --- END DIAGNOSTIC ---

      expect(result).toEqual(expected);
    });
  });
});

// describe('SHAM Parser Integration Tests', () => {
//   testNames.forEach((name, i) => {
//     const baseIndex = i * 2;
//     it(name, () => {
//       const input = codeBlocks[baseIndex].text;
//       const expected = JSON.parse(codeBlocks[baseIndex + 1].text);
//       const result = parseSHAM(input);
//       expect(result).toEqual(expected);
//     });
//   });
// });