import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { classifyLine } from '../src/line-classifier';

describe('line classifier', () => {
  const testCases = JSON.parse(
    readFileSync(join(__dirname, '../../nesl-test/tests/unit/line-classification/test-cases.json'), 'utf8')
  );

  Object.entries(testCases).forEach(([groupName, cases]) => {
    describe(groupName.replace(/_/g, ' '), () => {
      (cases as any[]).forEach(({ input, expected }) => {
        it(`classifies "${input}"`, () => {
          expect(classifyLine(input)).toEqual(expected);
        });
      });
    });
  });
});