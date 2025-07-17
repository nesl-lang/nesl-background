import { StringResult } from './types.js';

/**
 * Parses a string literal from the given input.
 * 
 * The entire input must be a valid string literal with optional surrounding whitespace.
 * No content is allowed before the opening marker or after the closing marker.
 * 
 * @param input - The string to parse (should contain only the string literal)
 * @param openMarker - Opening delimiter (default: 'R"""pv(')
 * @param closeMarker - Closing delimiter (default: ')pv"""')
 * @returns Either the extracted string value or an error
 */
export function parseStringLiteral(
  input: string,
  openMarker = 'R"""pv(',
  closeMarker = ')pv"""'
): StringResult {
  const trimmed = input.trim();
  
  // Empty input
  if (!trimmed) {
    return { success: false, error: 'string_not_found' };
  }
  
  // Must start with open marker
  if (!trimmed.startsWith(openMarker)) {
    // Check if markers exist somewhere in input
    if (trimmed.includes(openMarker)) {
      return { success: false, error: 'invalid_string_start' };
    }
    return { success: false, error: 'string_not_found' };
  }

  // Find last occurrence of close marker (per spec)
  const closeIndex = trimmed.lastIndexOf(closeMarker);
  
  // No close marker found
  if (closeIndex === -1 || closeIndex <= openMarker.length - 1) {
    return { success: false, error: 'string_unterminated' };
  }
  
  // Content after close marker
  if (closeIndex + closeMarker.length !== trimmed.length) {
    return { success: false, error: 'content_after_string' };
  }

  // Extract content between markers
  const content = trimmed.substring(openMarker.length, closeIndex);
  
  return { success: true, value: content };
}