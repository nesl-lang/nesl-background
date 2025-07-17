import type { AssignmentResult } from '../types';

/**
 * Parse a line that might be a key-value assignment
 * Returns 0-based UTF-16 code unit positions for errors
 * 
 * Position semantics by error type:
 * - EMPTY_KEY: Points to the '=' character
 * - INVALID_OPERATOR: Points to start of invalid operator (e.g., ':=' starts at ':')
 * - UNCLOSED_QUOTE: Points to the opening quote
 * - INVALID_VALUE: Points to start of the invalid value content
 * - TRAILING_CONTENT: Points to first character after valid value
 * - MALFORMED_ASSIGNMENT: Full line (position 0, length = line.length)
 */
export function parseAssignment(line: string): AssignmentResult {
  // Check for => operator specifically first
  const arrowOp = line.indexOf('=>');
  if (arrowOp !== -1) {
    // Check if there's a standalone = before the =>
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1 || equalIndex === arrowOp) {
      // No standalone = found, so => is invalid
      return {
        success: false,
        error: {
          code: 'INVALID_VALUE',
          position: arrowOp,
          length: 2
        }
      };
    }
  }
  
  // Check for := operator
  const colonEquals = line.indexOf(':=');
  if (colonEquals !== -1) {
    return {
      success: false,
      error: {
        code: 'INVALID_OPERATOR',
        position: colonEquals,
        length: 2
      }
    };
  }

  // Now, find the standard equals sign. If it's missing, it's a general malformed line.
  const equalIndex = line.indexOf('=');
  if (equalIndex === -1) {
    return {
      success: false,
      error: {
        code: 'MALFORMED_ASSIGNMENT',
        position: 0,
        length: line.length
      }
    };
  }
  
  // Check for empty key
  const beforeEqual = line.substring(0, equalIndex);
  const key = beforeEqual.trim();
  
  if (!key) {
    return {
      success: false,
      error: {
        code: 'EMPTY_KEY',
        position: equalIndex,
        length: 1
      }
    };
  }
  
  const afterEqual = line.substring(equalIndex + 1);
  const trimmedAfterEqual = afterEqual.trim();
  
  // Check if value is empty
  if (!trimmedAfterEqual) {
    // Point to position after the equals and any spaces
    const afterEqualLength = afterEqual.length;
    return {
      success: false,
      error: {
        code: 'INVALID_VALUE',
        position: equalIndex + 1 + afterEqualLength,
        length: 1
      }
    };
  }
  
  // Check for quoted value
  if (trimmedAfterEqual.startsWith('"')) {
    const valueStartIndex = equalIndex + 1 + afterEqual.indexOf('"');
    let i = 1; // Start after opening quote
    let escaped = false;
    let closingQuoteIndex = -1;
    
    while (i < trimmedAfterEqual.length) {
      if (trimmedAfterEqual[i] === '\n') {
        // Newline found before closing quote
        closingQuoteIndex = -1;
        break;
      } else if (trimmedAfterEqual[i] === '\\' && !escaped) {
        escaped = true;
      } else if (trimmedAfterEqual[i] === '"' && !escaped) {
        closingQuoteIndex = i;
        break;
      } else {
        escaped = false;
      }
      i++;
    }
    
    if (closingQuoteIndex === -1) {
      return {
        success: false,
        error: {
          code: 'UNCLOSED_QUOTE',
          position: valueStartIndex,
          length: line.length - valueStartIndex
        }
      };
    }
    
    try {
      const quotedPart = trimmedAfterEqual.substring(0, closingQuoteIndex + 1);
      const value = JSON.parse(quotedPart);
      
      // Check for trailing content after closing quote AFTER successful parse
      const afterClosingQuote = trimmedAfterEqual.substring(closingQuoteIndex + 1);
      if (afterClosingQuote.trim()) {
        // Find the position of first non-whitespace character after closing quote
        const afterQuoteWhitespace = afterClosingQuote.match(/^\s*/)[0].length;
        const trailingStartInTrimmed = closingQuoteIndex + 1 + afterQuoteWhitespace;
        const trailingStartInLine = equalIndex + 1 + afterEqual.indexOf(trimmedAfterEqual) + trailingStartInTrimmed;
        return {
          success: false,
          error: {
            code: 'TRAILING_CONTENT',
            position: trailingStartInLine,
            length: line.length - trailingStartInLine
          }
        };
      }
      
      return { success: true, type: 'key-value', key, value };
    } catch {
      return {
        success: false,
        error: {
          code: 'INVALID_VALUE',
          position: valueStartIndex,
          length: closingQuoteIndex + 1
        }
      };
    }
  }
  
  // Check for heredoc
  const heredocMatch = trimmedAfterEqual.match(/^<<'([^']+)'$/);
  if (heredocMatch) {
    return { success: true, type: 'heredoc', key, delimiter: heredocMatch[1] };
  }
  
  // Invalid value format
  const valueStart = equalIndex + 1 + afterEqual.indexOf(trimmedAfterEqual);
  return {
    success: false,
    error: {
      code: 'INVALID_VALUE',
      position: valueStart,
      length: trimmedAfterEqual.length
    }
  };
}