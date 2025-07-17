import { describe, it, expect } from 'vitest';
import { validateKey } from '../../src/validators/validateKey';
import testCases from '../../sham-shared/sham-test/unit/validateKey.test.json';

describe('validateKey', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = validateKey(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});