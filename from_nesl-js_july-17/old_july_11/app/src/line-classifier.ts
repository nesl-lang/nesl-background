import type { LineType } from './types.js';

/**
 * Classifies a line into its syntactic type.
 * Pure function - no state, just string analysis.
 */
export function classifyLine(line: string): LineType {
  const trimmed = line.trim();
  
  // Empty line
  if (!trimmed) {
    return { type: 'blank' };
  }
  
  // Structure delimiters (must be alone on line)
  if (trimmed === '{') return { type: 'object_start' };
  if (trimmed === '}') return { type: 'object_end' };
  if (trimmed === '[') return { type: 'array_start' };
  if (trimmed === ']') return { type: 'array_end' };
  if (trimmed === '(') return { type: 'multiline_start' };
  if (trimmed === ')') return { type: 'multiline_end' };
  
  // Assignment: contains = with non-empty key
  const eqIndex = line.indexOf('=');
  if (eqIndex > 0) {
    const key = line.substring(0, eqIndex).trim();
    if (key) {
      const rest = line.substring(eqIndex + 1);
      return { type: 'assignment', key, rest };
    }
  }
  
  // Array element: starts with -
  const dashIndex = line.indexOf('-');
  if (dashIndex >= 0 && line.substring(0, dashIndex).trim() === '') {
    // Dash is first non-whitespace character
    const rest = line.substring(dashIndex + 1);
    return { type: 'array_element', rest };
  }
  
  // Unknown line type - preserve exact content for error reporting
  return { type: 'unknown', line: line };
}