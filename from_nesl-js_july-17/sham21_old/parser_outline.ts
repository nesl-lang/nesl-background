// parser.ts
import { validateBlockId } from './validators/validateBlockId';
import { validateKey } from './validators/validateKey';
import { parseHeader } from './parsers/parseHeader';
import { parseEndMarker } from './parsers/parseEndMarker';
import { parseAssignment } from './parsers/parseAssignment';
import { parseQuotedString } from './parsers/parseQuotedString';
import { unescapeString } from './parsers/unescapeString';
import { getContextWindow } from './utils/getContextWindow';
import { classifyLine } from './utils/classifyLine';
import { validateHeredocDelimiter } from './validators/validateHeredocDelimiter';
import { getErrorPosition } from './utils/getErrorPosition';
import { findInvalidCharPosition } from './validators/findInvalidCharPosition';

// Types
export interface Block {
  id: string;
  properties: Record<string, string>;
  startLine: number;
  endLine: number | null;
}

export interface ParseError {
  code: string;
  line: number;
  column: number;
  length: number;
  blockId: string | null;
  content: string;
  context: string;
  message: string;
}

export interface ParseResult {
  blocks: Block[];
  errors: ParseError[];
}

type ParserState = 'SEEKING_HEADER' | 'IN_BLOCK' | 'IN_HEREDOC';

interface HeredocInfo {
  key: string;
  delimiter: string;
  content: string[];
  startLine: number;
}

// Main parser
export function parseSHAM(content: string): ParseResult {
  const lines = content.split(/\r?\n/);
  let state: ParserState = 'SEEKING_HEADER';
  const blocks: Block[] = [];
  const errors: ParseError[] = [];
  let currentBlock: Block | null = null;
  let heredocInfo: HeredocInfo | null = null;

  // Helper to add error with context
  const addError = (
    code: string,
    lineNum: number,
    message: string,
    column: number = 1,
    length?: number
  ) => {
    const line = lines[lineNum - 1] || '';
    errors.push({
      code,
      line: lineNum,
      column,
      length: length || line.length,
      blockId: currentBlock?.id || null,
      content: line,
      context: getContextWindow(lines, lineNum, 5).join('\n'),
      message
    });
  };

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const lineType = classifyLine(line);

    switch (state) {
      case 'SEEKING_HEADER': {
        if (lineType === 'header') {
          const headerResult = parseHeader(line);
          if (headerResult.isValid && headerResult.blockId) {
            const validation = validateBlockId(headerResult.blockId);
            if (validation.valid) {
              currentBlock = {
                id: headerResult.blockId,
                properties: {},
                startLine: lineNum,
                endLine: null
              };
              state = 'IN_BLOCK';
            } else {
              const pos = getErrorPosition(line, headerResult.blockId);
              addError(
                'INVALID_BLOCK_ID',
                lineNum,
                validation.error || 'Invalid block ID',
                pos.column,
                pos.length
              );
            }
          } else {
            addError('MALFORMED_HEADER', lineNum, 'Invalid SHAM header format');
          }
        } else if (lineType !== 'empty') {
          // Non-empty line outside of block
          addError(
            'MALFORMED_HEADER',
            lineNum,
            'Expected SHAM header or empty line'
          );
        }
        break;
      }

      case 'IN_BLOCK': {
        if (!currentBlock) break; // Should never happen

        if (lineType === 'end_marker') {
          const endResult = parseEndMarker(line);
          if (endResult.isEnd && endResult.blockId) {
            if (endResult.blockId === currentBlock.id) {
              currentBlock.endLine = lineNum;
              blocks.push(currentBlock);
              currentBlock = null;
              state = 'SEEKING_HEADER';
            } else {
              addError(
                'MISMATCHED_END',
                lineNum,
                `End marker '${endResult.blockId}' doesn't match block ID '${currentBlock.id}'`
              );
              // Recover by closing block anyway
              currentBlock.endLine = lineNum;
              blocks.push(currentBlock);
              currentBlock = null;
              state = 'SEEKING_HEADER';
            }
          }
        } else if (lineType === 'assignment') {
          const assignment = parseAssignment(line);
          
          if (assignment.type === 'key-value' && assignment.key && assignment.value !== undefined) {
            const keyValidation = validateKey(assignment.key);
            if (!keyValidation.valid) {
              const invalidChar = findInvalidCharPosition(assignment.key, /[A-Za-z0-9_]/);
              if (invalidChar) {
                addError(
                  'INVALID_KEY',
                  lineNum,
                  `Key contains invalid character '${invalidChar.char}' at position ${invalidChar.position + 1}`,
                  1,
                  assignment.key.length
                );
              } else {
                addError(
                  'INVALID_KEY',
                  lineNum,
                  keyValidation.error || 'Invalid key',
                  1,
                  assignment.key.length
                );
              }
            } else if (assignment.key in currentBlock.properties) {
              addError(
                'DUPLICATE_KEY',
                lineNum,
                `Duplicate key '${assignment.key}' in block '${currentBlock.id}'`,
                1,
                assignment.key.length
              );
            } else {
              currentBlock.properties[assignment.key] = unescapeString(assignment.value);
            }
          } else if (assignment.type === 'heredoc' && assignment.key && assignment.delimiter) {
            const keyValidation = validateKey(assignment.key);
            if (!keyValidation.valid) {
              addError(
                'INVALID_KEY',
                lineNum,
                keyValidation.error || 'Invalid key',
                1,
                assignment.key.length
              );
            } else if (assignment.key in currentBlock.properties) {
              addError(
                'DUPLICATE_KEY',
                lineNum,
                `Duplicate key '${assignment.key}' in block '${currentBlock.id}'`,
                1,
                assignment.key.length
              );
            } else {
              const delimiterValidation = validateHeredocDelimiter(assignment.delimiter, currentBlock.id);
              if (delimiterValidation.valid) {
                heredocInfo = {
                  key: assignment.key,
                  delimiter: assignment.delimiter,
                  content: [],
                  startLine: lineNum
                };
                state = 'IN_HEREDOC';
              } else {
                addError(
                  'INVALID_HEREDOC_DELIMITER',
                  lineNum,
                  delimiterValidation.error || 'Invalid heredoc delimiter'
                );
              }
            }
          } else if (assignment.type === 'invalid') {
            // Handle various invalid assignment cases
            if (line.trim().startsWith('=')) {
              addError('EMPTY_KEY', lineNum, 'Assignment without key name');
            } else if (line.includes(':=')) {
              const pos = getErrorPosition(line, ':=');
              addError(
                'INVALID_ASSIGNMENT_OPERATOR',
                lineNum,
                "Invalid assignment operator - only '=' is allowed",
                pos.column,
                2
              );
            } else if (line.includes('=')) {
              // Has = but invalid value
              const equalPos = line.indexOf('=');
              const afterEqual = line.substring(equalPos + 1).trim();
              if (afterEqual && !afterEqual.startsWith('"') && !afterEqual.startsWith("<<'")) {
                const pos = getErrorPosition(line, afterEqual);
                addError(
                  'INVALID_VALUE',
                  lineNum,
                  'Value must be a quoted string or heredoc',
                  pos.column,
                  afterEqual.length
                );
              } else if (afterEqual.startsWith('"')) {
                // Unclosed quote
                const pos = getErrorPosition(line, '"');
                addError(
                  'UNCLOSED_QUOTE',
                  lineNum,
                  'Unclosed quoted string',
                  pos.column,
                  line.length - pos.column + 1
                );
              }
            } else {
              addError(
                'MALFORMED_ASSIGNMENT',
                lineNum,
                `Invalid line format in block '${currentBlock.id}': not a valid key-value assignment or empty line`
              );
            }
          }
        } else if (lineType === 'empty') {
          // Empty lines are allowed in blocks
          continue;
        } else {
          addError(
            'MALFORMED_ASSIGNMENT',
            lineNum,
            `Invalid line format in block '${currentBlock.id}': not a valid key-value assignment or empty line`
          );
        }
        break;
      }

      case 'IN_HEREDOC': {
        if (!heredocInfo || !currentBlock) break; // Should never happen

        if (line === heredocInfo.delimiter) {
          // End of heredoc - strip final newline as per spec
          const content = heredocInfo.content.join('\n');
          currentBlock.properties[heredocInfo.key] = content;
          heredocInfo = null;
          state = 'IN_BLOCK';
        } else {
          // All lines in heredoc are content, including SHAM markers
          heredocInfo.content.push(line);
        }
        break;
      }
    }
  }

  // Handle EOF conditions
  if (state === 'IN_HEREDOC' && heredocInfo && currentBlock) {
    addError(
      'UNCLOSED_HEREDOC',
      lines.length + 1,
      `Heredoc '${heredocInfo.delimiter}' not closed before EOF`,
      1,
      0
    );
    // Don't save partial block with unclosed heredoc
    currentBlock.endLine = null;
    blocks.push(currentBlock);
  } else if (state === 'IN_BLOCK' && currentBlock) {
    addError(
      'UNCLOSED_BLOCK',
      lines.length + 1,
      `Block '${currentBlock.id}' not closed before EOF`,
      1,
      0
    );
    currentBlock.endLine = null;
    blocks.push(currentBlock);
  }

  return { blocks, errors };
}


// This parser:

// 1. **Uses all the pure functions** we identified for testable logic
// 2. **Maintains clean separation** between parsing logic and state management
// 3. **Handles all error cases** from the test suite with proper error codes
// 4. **Implements error recovery** - continues parsing after errors
// 5. **Provides precise error positions** with column and length info
// 6. **Preserves all content exactly** as specified (no normalization except unescaping)

// The main complexity is in the `IN_BLOCK` state handling various invalid assignment formats, but this gives users helpful, specific error messages rather than generic "malformed" errors.
