import { KEY_START_PATTERN, KEY_CHARS_PATTERN, EXCLUDE_CHARS_PATTERN } from '../patterns';

interface InvalidChar {
  position: number;
  char: string;
}

/**
 * Find first invalid character in a key
 * Returns 0-based UTF-16 code unit position and the character
 * Note: For characters outside BMP, position may point to a surrogate pair
 */
export function findInvalidCharPosition(key: string): InvalidChar | null {
  let position = 0;
  
  // Use string iterator to handle surrogate pairs correctly
  for (const char of key) {
    // First position must be letter or underscore
    if (position === 0 && !char.match(/[\p{L}_]/u)) {
      return { position, char };
    }
    
    // Other positions must be letter, number, or underscore
    if (position > 0 && !char.match(/[\p{L}\p{N}_]/u)) {
      return { position, char };
    }
    
    // Check for excluded characters (control, zero-width)
    if (EXCLUDE_CHARS_PATTERN.test(char)) {
      return { position, char };
    }
    
    // Advance position by the number of code units this character uses
    position += char.length;
  }
  
  return null;
}