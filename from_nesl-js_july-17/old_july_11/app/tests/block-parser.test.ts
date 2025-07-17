import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseBlock } from '../src/block-parser/block-parser';
import { extractBlocks } from '../src/block-extractor';
import type { ParseOptions, ParseError } from '../src/types';

describe('block parser', () => {
  const testDir = join(__dirname, '../../nesl-test/tests/unit/block-parser');
  
  /**
   * Helper to read test case files and parse expected results
   */
  function readTestCase(filepath: string) {
    const basename = filepath.replace(/\.nesl$/, '');
    const input = readFileSync(filepath, 'utf8');
    const expectedData = JSON.parse(
      readFileSync(`${basename}.json`, 'utf8')
    );
    
    // Handle both old format (array) and new format (object with config/errors)
    let expected: any[];
    let errors: ParseError[] = [];
    let config: ParseOptions | undefined;
    
    if (Array.isArray(expectedData)) {
      // Simple success case - just the expected data
      expected = expectedData;
    } else if (expectedData.errors) {
      // Error case - no data, just errors
      expected = [];
      errors = expectedData.errors;
    } else if (expectedData.expected) {
      // Custom config case
      expected = expectedData.expected;
      config = expectedData.config;
      errors = expectedData.errors || [];
    } else {
      // Shouldn't happen
      throw new Error(`Unexpected test format in ${basename}.json`);
    }
    
    return { input, expected, errors, config };
  }
  
  /**
   * Run a single test file
   */
  function runTest(testFile: string, testName: string) {
    it(testName, () => {
      const { input, expected, errors: expectedErrors, config } = readTestCase(testFile);
      
      // Extract blocks first
      const extraction = extractBlocks(
        input, 
        config?.blockStart, 
        config?.blockEnd
      );
      
      // Should have exactly one block for unit tests
      expect(extraction.errors).toEqual([]);
      expect(extraction.blocks).toHaveLength(1);
      
      const block = extraction.blocks[0];
      
      // Parse the block
      // For unit tests, create synthetic file lines from the full input
      const fileLines = input.split('\n');
      const result = parseBlock(block.content, block.startLine, fileLines, config);
      
      if (expectedErrors.length > 0) {
        // Error case - check errors match
        expect(result.errors).toHaveLength(expectedErrors.length);
        
        result.errors.forEach((error, i) => {
          const expected = expectedErrors[i];
          expect(error.line).toBe(expected.line);
          expect(error.code).toBe(expected.code);
          expect(error.message).toBe(expected.message);
          expect(error.content).toBe(expected.content);
          expect(error.context).toBe(expected.context);
        });
      } else {
        // Success case - check parsed data
        expect(result.errors).toEqual([]);
        expect(result.data).toEqual(expected);
      }
    });
  }
  
  /**
   * Recursively find all .nesl files in a directory
   */
  function findTestFiles(dir: string): { file: string; name: string }[] {
    const fs = require('fs');
    const files: { file: string; name: string }[] = [];
    
    function scan(currentDir: string, prefix: string = '') {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name);
        } else if (entry.name.endsWith('.nesl')) {
          const testName = prefix 
            ? `${prefix}/${entry.name.replace('.nesl', '')}`
            : entry.name.replace('.nesl', '');
          files.push({ file: fullPath, name: testName });
        }
      }
    }
    
    scan(dir);
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Group tests by directory
  describe('basics', () => {
    const basicTests = findTestFiles(join(testDir, 'basics'));
    basicTests.forEach(({ file, name }) => {
      runTest(file, name);
    });
  });
  
  describe('edge-cases', () => {
    const edgeTests = findTestFiles(join(testDir, 'edge-cases'));
    edgeTests.forEach(({ file, name }) => {
      runTest(file, name);
    });
  });
  
  describe('nesting', () => {
    const nestingTests = findTestFiles(join(testDir, 'nesting'));
    nestingTests.forEach(({ file, name }) => {
      runTest(file, name);
    });
  });
  
  describe('recovery', () => {
    const recoveryTests = findTestFiles(join(testDir, 'recovery'));
    recoveryTests.forEach(({ file, name }) => {
      runTest(file, name);
    });
  });
  
  describe('state-errors', () => {
    const stateTests = findTestFiles(join(testDir, 'state-errors'));
    stateTests.forEach(({ file, name }) => {
      runTest(file, name);
    });
  });
  
  describe('structure-errors', () => {
    const structureTests = findTestFiles(join(testDir, 'structure-errors'));
    structureTests.forEach(({ file, name }) => {
      runTest(file, name);
    });
  });
});