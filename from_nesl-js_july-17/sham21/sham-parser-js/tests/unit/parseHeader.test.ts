import { describe, it, expect } from 'vitest';
import { parseHeader } from '../../src/parsers/parseHeader';
import testCases from '../../sham-shared/sham-test/unit/parseHeader.test.json';

describe('parseHeader', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = parseHeader(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});