import type { Block, ParseError } from './types.js';
import { getContext } from './block-parser/value-parsers.js';

export interface BlockExtractionResult {
  blocks: Block[];
  errors: ParseError[];
}

/**
 * Extracts NESL blocks from mixed content.
 * 
 * Blocks are delimited by blockStart and blockEnd markers on their own lines.
 * Line numbers in results are 1-based and file-relative.
 * 
 * @param content - The full file content to extract blocks from
 * @param blockStart - Opening delimiter (default: '<<<<<<<<<nesl')
 * @param blockEnd - Closing delimiter (default: '=========nesl')
 * @returns Extracted blocks and any errors encountered
 */
export function extractBlocks(
  content: string,
  blockStart = '<<<<<<<<<nesl',
  blockEnd = '=========nesl'
): BlockExtractionResult {
  const blocks: Block[] = [];
  const errors: ParseError[] = [];
  const lines = content.split('\n');
  
  let currentBlockStart: number | null = null;
  let currentBlockLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fileLineNum = i + 1; // 1-based
    
    if (line.trim() === blockStart) {
      if (currentBlockStart !== null) {
        // Nested block start - this is an error
        errors.push({
          line: fileLineNum,
          code: 'unclosed_block',
          message: `Found ${blockStart} at line ${fileLineNum} while previous block at line ${currentBlockStart} is still open`,
          content: line,
          context: getContext(lines, i)
        });
      } else {
        currentBlockStart = fileLineNum;
        currentBlockLines = [];
      }
    } else if (line.trim() === blockEnd) {
      if (currentBlockStart === null) {
        // Orphaned closing marker
        errors.push({
          line: fileLineNum,
          code: 'orphaned_closing_marker',
          message: `Found ${blockEnd} without matching ${blockStart}`,
          content: line,
          context: getContext(lines, i)
        });
      } else {
        // Valid block end
        blocks.push({
          content: currentBlockLines.join('\n'),
          startLine: currentBlockStart  // Line number of the marker itself
        });
        currentBlockStart = null;
        currentBlockLines = [];
      }
    } else {
      // Regular content line
      if (currentBlockStart !== null) {
        currentBlockLines.push(line);
      }
    }
  }
  
  // Check for unclosed block at EOF
  if (currentBlockStart !== null) {
    // Build context including the start marker and up to 4 lines of content (5 total)
    const contextLines = [lines[currentBlockStart - 1], ...currentBlockLines.slice(0, 4)];
    errors.push({
      line: currentBlockStart,
      code: 'unclosed_block',
      message: `Block starting at line ${currentBlockStart} was not closed with ${blockEnd}`,
      content: lines[currentBlockStart - 1],
      context: contextLines.join('\n')
    });
  }
  
  return { blocks, errors };
}

/**
 * Gets context lines around a target line for error reporting.
 * Returns 5 lines with target at line 2 (0-indexed) when possible.
 * Clamps to file boundaries.
 */
export function getContext(lines: string[], targetIndex: number): string {
  const start = Math.max(0, targetIndex - 2);
  const end = Math.min(lines.length, start + 5);
  return lines.slice(start, end).join('\n');
}