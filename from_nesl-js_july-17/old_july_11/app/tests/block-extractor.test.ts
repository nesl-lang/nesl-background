import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractBlocks } from '../src/block-extractor';
import type { ParseError } from '../src/types';

describe('block extractor', () => {
  const testDir = join(__dirname, '../../nesl-test/tests/unit/block-extraction');
  
  /**
   * Helper to read test case files
   */
  function readTestCase(basename: string) {
    const input = readFileSync(join(testDir, `${basename}.nesl`), 'utf8');
    const expected = JSON.parse(
      readFileSync(join(testDir, `${basename}.json`), 'utf8')
    );
    return { input, expected };
  }

  it('extracts single block with surrounding text', () => {
    const { input, expected } = readTestCase('001_single_block');
    const result = extractBlocks(input);
    
    expect(result.blocks).toEqual(expected.blocks);
    expect(result.errors).toEqual(expected.errors);
  });

  it('extracts multiple blocks correctly', () => {
    const { input, expected } = readTestCase('002_multiple_blocks');
    const result = extractBlocks(input);
    
    expect(result.blocks).toEqual(expected.blocks);
    expect(result.errors).toEqual(expected.errors);
  });

  it('reports error for unclosed block', () => {
    const { input, expected } = readTestCase('003_unclosed_block');
    const result = extractBlocks(input);
    
    expect(result.blocks).toEqual(expected.blocks);
    expect(result.errors).toHaveLength(1);
    
    const error = result.errors[0];
    expect(error.code).toBe('unclosed_block');
    expect(error.line).toBe(1);
    expect(error.message).toContain('not closed');
  });

  it('reports error for orphaned closing marker', () => {
    const { input, expected } = readTestCase('004_orphaned_closing_marker');
    const result = extractBlocks(input);
    
    expect(result.blocks).toEqual(expected.blocks);
    expect(result.errors).toHaveLength(1);
    
    const error = result.errors[0];
    expect(error.code).toBe('orphaned_closing_marker');
    expect(error.line).toBe(6);
    expect(error.message).toContain('without matching');
  });

  it('ignores nested markers inside string literals', () => {
    const { input, expected } = readTestCase('005_nested_block_markers');
    const result = extractBlocks(input);
    
    expect(result.blocks).toEqual(expected.blocks);
    expect(result.errors).toEqual(expected.errors);
  });

  it('handles custom block markers', () => {
    const { input, expected } = readTestCase('006_custom_markers');
    const { config } = expected;
    
    const result = extractBlocks(input, config.blockStart, config.blockEnd);
    
    // Compare blocks and errors, excluding config from expected
    expect(result.blocks).toEqual(expected.blocks);
    expect(result.errors).toEqual(expected.errors);
  });
});