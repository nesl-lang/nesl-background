import { extractBlocks } from './block-extractor.js';
import { parseBlock } from './block-parser/block-parser.js';
import type { ParseOptions, ParseResult, NeslValue, ParseError } from './types.js';

/**
 * Main parser entry point. Extracts NESL blocks from mixed content and parses each one.
 * 
 * Two-phase process:
 * 1. Extract blocks (fatal errors stop all parsing)
 * 2. Parse each block independently (errors collected across blocks)
 * 
 * @param content - Full document content potentially containing NESL blocks
 * @param options - Optional parser configuration
 * @returns Parsed values and any errors encountered
 */
export function parse(content: string, options?: ParseOptions): ParseResult {
  // Phase 1: Extract blocks
  const extraction = extractBlocks(content, options?.blockStart, options?.blockEnd);
  
  // Block extraction errors are fatal
  if (extraction.errors.length > 0) {
    return { data: [], errors: extraction.errors };
  }
  
  // Phase 2: Parse each block
  const allData: NeslValue[] = [];
  const allErrors: ParseError[] = [];
  const fileLines = content.split('\n');
  
  for (const block of extraction.blocks) {
    const result = parseBlock(block.content, block.startLine, fileLines, options);
    
    // Collect data and errors from each block
    allData.push(...result.data);
    allErrors.push(...result.errors);
  }
  
  // If any errors occurred, return only errors (no data)
  if (allErrors.length > 0) {
    return { data: [], errors: allErrors };
  }
  
  return { data: allData, errors: [] };
}