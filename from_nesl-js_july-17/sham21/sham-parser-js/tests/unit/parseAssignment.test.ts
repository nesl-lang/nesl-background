import { describe, it, expect } from 'vitest';
import { parseAssignment } from '../../src/parsers/parseAssignment';
import testCases from '../../sham-shared/sham-test/unit/parseAssignment.test.json';

describe('parseAssignment', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = parseAssignment(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});