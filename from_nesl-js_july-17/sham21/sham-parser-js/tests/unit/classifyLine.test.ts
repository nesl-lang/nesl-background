import { describe, it, expect } from 'vitest';
import { classifyLine } from '../../src/utils/classifyLine';
import testCases from '../../sham-shared/sham-test/unit/classifyLine.test.json';

describe('classifyLine', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = classifyLine(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});