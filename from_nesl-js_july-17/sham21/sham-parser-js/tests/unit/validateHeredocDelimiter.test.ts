import { describe, it, expect } from 'vitest';
import { validateHeredocDelimiter } from '../../src/validators/validateHeredocDelimiter';
import testCases from '../../sham-shared/sham-test/unit/validateHeredocDelimiter.test.json';

describe('validateHeredocDelimiter', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = validateHeredocDelimiter(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});