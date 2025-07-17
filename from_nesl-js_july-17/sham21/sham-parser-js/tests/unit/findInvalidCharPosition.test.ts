import { describe, it, expect } from 'vitest';
import { findInvalidCharPosition } from '../../src/validators/findInvalidCharPosition';
import testCases from '../../sham-shared/sham-test/unit/findInvalidCharPosition.test.json';

describe('findInvalidCharPosition', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = findInvalidCharPosition(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});