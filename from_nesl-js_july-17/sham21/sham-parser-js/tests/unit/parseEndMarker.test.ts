import { describe, it, expect } from 'vitest';
import { parseEndMarker } from '../../src/parsers/parseEndMarker';
import testCases from '../../sham-shared/sham-test/unit/parseEndMarker.test.json';

describe('parseEndMarker', () => {
  testCases.groups.forEach(group => {
    describe(group.name, () => {
      group.tests.forEach(test => {
        it(test.name, () => {
          const result = parseEndMarker(...test.input);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});