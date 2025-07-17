import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseStringLiteral } from '../src/string-parser';

describe('string parser', () => {
  describe('line extraction tests', () => {
    const testDir = join(__dirname, '../../nesl-test/tests/unit/string-literals');
    
    // Test default delimiters
    it('handles standard NESL string literals', () => {
      const lines = readFileSync(join(testDir, '001_line_extraction.txt'), 'utf8')
        .split('\n')
        .filter(line => line !== ''); // Remove empty lines
        
      const expected = JSON.parse(
        readFileSync(join(testDir, '001_line_extraction_expected.json'), 'utf8')
      );
      
      lines.forEach((line, idx) => {
        const result = parseStringLiteral(line);
        const expectedResult = expected[idx];
        
        if (expectedResult.value !== undefined) {
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.value).toBe(expectedResult.value);
          }
        } else {
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe(expectedResult.error);
          }
        }
      });
    });
    
    // Test custom delimiters
    it('handles custom delimiter syntax', () => {
      const lines = readFileSync(join(testDir, '002_custom_delimiters.txt'), 'utf8')
        .split('\n')
        .filter(line => line !== '');
        
      const testData = JSON.parse(
        readFileSync(join(testDir, '002_custom_delimiters_expected.json'), 'utf8')
      );
      
      const { stringOpen, stringClose } = testData.config;
      const expected = testData.results;
      
      lines.forEach((line, idx) => {
        const result = parseStringLiteral(line, stringOpen, stringClose);
        const expectedResult = expected[idx];
        
        if (expectedResult.value !== undefined) {
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.value).toBe(expectedResult.value);
          }
        } else {
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe(expectedResult.error);
          }
        }
      });
    });
  });
  
  // Direct unit tests for edge cases
  describe('algorithm edge cases', () => {
    it('returns error when no opening marker found', () => {
      const result = parseStringLiteral('no markers here');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('string_not_found');
      }
    });
    
    it('returns error when no closing marker found', () => {
      const result = parseStringLiteral('R"""pv(unclosed');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('string_unterminated');
      }
    });
    
    it('handles empty string', () => {
      const result = parseStringLiteral('R"""pv()pv"""');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('');
      }
    });
    
    it('handles whitespace before and after markers', () => {
      const result = parseStringLiteral('  R"""pv(test)pv"""  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('test');
      }
    });
    
    it('extracts content between first open and last close', () => {
      const result = parseStringLiteral('R"""pv(first)pv""" R"""pv(second)pv"""');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('first)pv""" R"""pv(second');
      }
    });
  });
});