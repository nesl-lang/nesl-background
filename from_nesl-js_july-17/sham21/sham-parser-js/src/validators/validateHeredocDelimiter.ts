import type { ValidationResult } from '../types';
import { HEREDOC_PREFIX } from '../patterns';

/**
 * Validate heredoc delimiter matches expected format
 * Must be exactly 'EOT_SHAM_' + blockId
 */
export function validateHeredocDelimiter(delimiter: string, blockId: string): ValidationResult {
  const expected = `${HEREDOC_PREFIX}${blockId}`;
  
  if (delimiter !== expected) {
    return {
      valid: false,
      error: `Heredoc delimiter must be '${expected}'`
    };
  }
  
  return { valid: true };
}