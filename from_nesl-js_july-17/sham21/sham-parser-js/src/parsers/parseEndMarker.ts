import type { EndMarkerResult } from '../types';

/**
 * Parse SHAM end marker line
 * Expected format: #!END_SHAM_XXX
 */
export function parseEndMarker(line: string): EndMarkerResult {
  const match = line.match(/^#!END_SHAM_([A-Za-z0-9]{3})$/);
  
  if (!match) {
    return { isEnd: false };
  }
  
  return {
    isEnd: true,
    blockId: match[1]
  };
}