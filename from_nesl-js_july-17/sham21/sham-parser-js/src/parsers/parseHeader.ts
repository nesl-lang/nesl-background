import type { HeaderResult } from '../types';

/**
 * Parse SHAM header line
 * Expected format: #!SHAM [@three-char-SHA-256: XXX]
 */
export function parseHeader(line: string): HeaderResult {
  const match = line.match(/^#!SHAM \[@three-char-SHA-256: ([^\]]+)\]$/);
  
  if (!match) {
    return { isValid: false };
  }
  
  return {
    isValid: true,
    blockId: match[1]
  };
}