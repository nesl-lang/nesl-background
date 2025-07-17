import { validateBlockId } from './validators/validateBlockId';
import { validateKey } from './validators/validateKey';
import { findInvalidCharPosition } from './validators/findInvalidCharPosition';
import { validateHeredocDelimiter } from './validators/validateHeredocDelimiter';
import { parseHeader } from './parsers/parseHeader';
import { parseEndMarker } from './parsers/parseEndMarker';
import { parseAssignment } from './parsers/parseAssignment';
import { classifyLine } from './utils/classifyLine';
import { getContextWindow } from './utils/getContextWindow';
import type { Block, ParseError, ParseResult, CharIndex, Column, LineNumber } from './types';

type ParserState = 'SEEKING_HEADER' | 'IN_BLOCK' | 'IN_HEREDOC';

interface HeredocInfo {
  key: string;
  delimiter: string;
  content: string[];
  startLine: number;
}

/**
 * Parse SHAM format content into blocks and errors
 * All parsing uses 0-based indices internally, converted to 1-based for output
 */
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
    lineNum: LineNumber,
    message: string,
    column: CharIndex = 0,
    length?: number
  ) => {
    const line = lines[lineNum - 1] || '';
    errors.push({
      code,
      line: lineNum,
      column: column + 1, // Convert to 1-based
      length: length !== undefined ? length : line.length,
      blockId: currentBlock?.id || null,
      content: line,
      context: getContextWindow(content, lineNum),
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
              const blockIdIndex = line.indexOf(headerResult.blockId);
              addError(
                'INVALID_BLOCK_ID',
                lineNum,
                validation.error || 'Invalid block ID',
                blockIdIndex >= 0 ? blockIdIndex : 0,
                headerResult.blockId.length
              );
            }
          } else {
            addError('MALFORMED_HEADER', lineNum, 'Invalid SHAM header format');
          }
        } else if (lineType !== 'empty') {
          // Non-empty line outside of block - skip silently
        }
        break;
      }

      case 'IN_BLOCK': {
        if (!currentBlock) break;

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
        } else if (lineType === 'header') {
          // New header without closing previous block
          addError(
            'UNCLOSED_BLOCK',
            lineNum - 1,
            `Block '${currentBlock.id}' not closed before new block`,
            0,
            0
          );
          // Process the new header
          const headerResult = parseHeader(line);
          if (headerResult.isValid && headerResult.blockId) {
            const validation = validateBlockId(headerResult.blockId);
            if (validation.valid) {
              // Save previous block without endLine
              blocks.push(currentBlock);
              currentBlock = {
                id: headerResult.blockId,
                properties: {},
                startLine: lineNum,
                endLine: null
              };
            } else {
              // Save previous block and go to seeking state
              blocks.push(currentBlock);
              currentBlock = null;
              state = 'SEEKING_HEADER';
              const blockIdIndex = line.indexOf(headerResult.blockId);
              addError(
                'INVALID_BLOCK_ID',
                lineNum,
                validation.error || 'Invalid block ID',
                blockIdIndex >= 0 ? blockIdIndex : 0,
                headerResult.blockId.length
              );
            }
          }
        } else if (lineType === 'assignment') {
          const assignment = parseAssignment(line);
          
          if (assignment.success) {
            if (assignment.type === 'key-value') {
              // Check for leading whitespace in the original line
              const equalIndex = line.indexOf('=');
              const rawKey = line.substring(0, equalIndex);
              const hasLeadingWhitespace = rawKey.length > 0 && rawKey[0] !== rawKey.trimStart()[0];
              
              const keyValidation = validateKey(assignment.key);
              if (!keyValidation.valid || hasLeadingWhitespace) {
                const invalidChar = findInvalidCharPosition(assignment.key);
                if (hasLeadingWhitespace) {
                  // Report error for leading whitespace
                  const leadingChar = rawKey[0];
                  addError(
                    'INVALID_KEY',
                    lineNum,
                    `Key contains invalid character '${leadingChar}' at position 1`,
                    0,
                    rawKey.trimEnd().length
                  );
                } else if (invalidChar) {
                  addError(
                    'INVALID_KEY',
                    lineNum,
                    `Key contains invalid character '${invalidChar.char}' at position ${invalidChar.position + 1}`,
                    0,
                    assignment.key.length
                  );
                } else {
                  addError(
                    'INVALID_KEY',
                    lineNum,
                    keyValidation.error || 'Invalid key',
                    0,
                    assignment.key.length
                  );
                }
              } else if (assignment.key in currentBlock.properties) {
                addError(
                  'DUPLICATE_KEY',
                  lineNum,
                  `Duplicate key '${assignment.key}' in block '${currentBlock.id}'`,
                  0,
                  assignment.key.length
                );
                // Still update the value - last one wins
                currentBlock.properties[assignment.key] = assignment.value;
              } else {
                currentBlock.properties[assignment.key] = assignment.value;
              }
            } else if (assignment.type === 'heredoc') {
              // Check for leading whitespace in the original line
              const equalIndex = line.indexOf('=');
              const rawKey = line.substring(0, equalIndex);
              const hasLeadingWhitespace = rawKey.length > 0 && rawKey[0] !== rawKey.trimStart()[0];
              
              const keyValidation = validateKey(assignment.key);
              if (!keyValidation.valid || hasLeadingWhitespace) {
                const invalidChar = findInvalidCharPosition(assignment.key);
                if (hasLeadingWhitespace) {
                  // Report error for leading whitespace
                  const leadingChar = rawKey[0];
                  addError(
                    'INVALID_KEY',
                    lineNum,
                    `Key contains invalid character '${leadingChar}' at position 1`,
                    0,
                    rawKey.trimEnd().length
                  );
                } else if (invalidChar) {
                  addError(
                    'INVALID_KEY',
                    lineNum,
                    `Key contains invalid character '${invalidChar.char}' at position ${invalidChar.position + 1}`,
                    0,
                    assignment.key.length
                  );
                } else {
                  addError(
                    'INVALID_KEY',
                    lineNum,
                    keyValidation.error || 'Invalid key',
                    0,
                    assignment.key.length
                  );
                }
              }
              
              if (keyValidation.valid && !hasLeadingWhitespace && assignment.key in currentBlock.properties) {
                addError(
                  'DUPLICATE_KEY',
                  lineNum,
                  `Duplicate key '${assignment.key}' in block '${currentBlock.id}'`,
                  0,
                  assignment.key.length
                );
              }
              
              // Process heredoc if key is valid (duplicate or not)
              if (keyValidation.valid) {
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
                  const delimiterIndex = line.indexOf(assignment.delimiter);
                  addError(
                    'INVALID_HEREDOC_DELIMITER',
                    lineNum,
                    delimiterValidation.error || 'Invalid heredoc delimiter',
                    delimiterIndex >= 0 ? delimiterIndex : 0,
                    assignment.delimiter.length
                  );
                }
              }
            }
          } else {
            // Handle assignment parse errors
            const error = assignment.error;
            if (error.code === 'INVALID_OPERATOR') {
              // Extract the operator from the line
              const operator = line.substring(error.position, error.position + error.length);
              addError(
                'INVALID_ASSIGNMENT_OPERATOR',
                lineNum,
                `Invalid assignment operator '${operator}' - only '=' is allowed`,
                error.position,
                error.length
              );
            } else if (error.code === 'TRAILING_CONTENT') {
              // For trailing content, we can still parse the key-value part
              // Try to extract just the valid part
              const equalIndex = line.indexOf('=');
              const afterEqual = line.substring(equalIndex + 1).trim();
              if (afterEqual.startsWith('"')) {
                let i = 1;
                let escaped = false;
                while (i < afterEqual.length && (afterEqual[i] !== '"' || escaped)) {
                  escaped = afterEqual[i] === '\\' && !escaped;
                  i++;
                }
                if (i < afterEqual.length && afterEqual[i] === '"') {
                  try {
                    const quotedPart = afterEqual.substring(0, i + 1);
                    const value = JSON.parse(quotedPart);
                    const keyPart = line.substring(0, equalIndex).trim();
                    const keyValidation = validateKey(keyPart);
                    if (keyValidation.valid && !(keyPart in currentBlock.properties)) {
                      currentBlock.properties[keyPart] = value;
                    }
                  } catch {
                    // Ignore parse errors, we already have TRAILING_CONTENT error
                  }
                }
              }
              addError(
                error.code,
                lineNum,
                getErrorMessage(error.code, line, currentBlock?.id),
                error.position,
                error.length
              );
            } else {
              addError(
                error.code,
                lineNum,
                getErrorMessage(error.code, line, currentBlock?.id),
                error.position,
                error.length
              );
            }
          }
        } else if (lineType === 'empty') {
          // Empty lines are allowed in blocks
        } else {
          // Unknown line type in block
          addError(
            'MALFORMED_ASSIGNMENT',
            lineNum,
            `Invalid line format in block '${currentBlock.id}': not a valid key-value assignment or empty line`
          );
        }
        break;
      }

      case 'IN_HEREDOC': {
        if (!heredocInfo || !currentBlock) break;

        if (line === heredocInfo.delimiter) {
          // End of heredoc
          const content = heredocInfo.content.join('\n');
          currentBlock.properties[heredocInfo.key] = content;
          heredocInfo = null;
          state = 'IN_BLOCK';
        } else {
          // All lines in heredoc are content
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
      0,
      0
    );
    // Save partial block
    currentBlock.endLine = null;
    blocks.push(currentBlock);
  } else if (state === 'IN_BLOCK' && currentBlock) {
    addError(
      'UNCLOSED_BLOCK',
      lines.length + 1,
      `Block '${currentBlock.id}' not closed before EOF`,
      0,
      0
    );
    currentBlock.endLine = null;
    blocks.push(currentBlock);
  }

  return { blocks, errors };
}

/**
 * Get appropriate error message for error code
 */
function getErrorMessage(code: string, line: string, blockId?: string | null): string {
  switch (code) {
    case 'EMPTY_KEY':
      return 'Assignment without key name';
    case 'UNCLOSED_QUOTE':
      return 'Unclosed quoted string';
    case 'INVALID_VALUE':
      return 'Value must be a quoted string or heredoc';
    case 'TRAILING_CONTENT':
      return 'Unexpected content after quoted value';
    case 'MALFORMED_ASSIGNMENT':
      return blockId 
        ? `Invalid line format in block '${blockId}': not a valid key-value assignment or empty line`
        : 'Invalid assignment format';
    default:
      return 'Invalid syntax';
  }
}