import type { ValidationResult } from '../types';
import { KEY_START_PATTERN, KEY_CHARS_PATTERN, EXCLUDE_CHARS_PATTERN, KEY_MAX_LENGTH } from '../patterns';

/**
 * Validate key name meets requirements:
 * - Starts with Unicode letter or underscore
 * - Contains only Unicode letters, digits, underscores
 * - No whitespace or control characters
 * - Max 256 characters
 */
export function validateKey(key: string): ValidationResult {
  if (!key) {
    return { valid: false, error: 'Key cannot be empty' };
  }
  
  if (key.length > KEY_MAX_LENGTH) {
    return { valid: false, error: `Key exceeds ${KEY_MAX_LENGTH} character limit` };
  }
  
  // Check first character using iterator to handle surrogate pairs
  const firstChar = [...key][0];
  if (!firstChar.match(/[\p{L}_]/u)) {
    return { valid: false, error: 'Key must start with letter or underscore' };
  }
  
  // Check for excluded characters (zero-width spaces, control chars) FIRST
  if (EXCLUDE_CHARS_PATTERN.test(key)) {
    return { valid: false, error: 'Key contains invalid characters' };
  }
  
  // Then check all characters are valid
  if (!KEY_CHARS_PATTERN.test(key)) {
    return { valid: false, error: 'Key contains invalid characters' };
  }
  
  return { valid: true };
}