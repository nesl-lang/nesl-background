import { describe, it, expect } from 'vitest';
import { validateBlockId } from '../../src/validators/validateBlockId';
import testCases from '../../sham-shared/sham-test/unit/validateBlockId.test.json';

describe('validateBlockId', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = validateBlockId(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});