import type { NeslValue, ParseOptions } from '../types.js';
import { defaultConfig } from '../types.js';

/**
 * Checks if a key is valid according to NESL rules.
 * Keys must not contain whitespace, equals signs, or be empty.
 */
export function isValidKey(key: string, maxKeyLength?: number): { valid: boolean; reason?: string } {
  const limit = maxKeyLength ?? defaultConfig.maxKeyLength!;
  
  if (!key) return { valid: false, reason: 'empty key' };
  if (key.includes(' ') || key.includes('\t') || key.includes('\n')) {
    return { valid: false, reason: 'whitespace' };
  }
  if (key.includes('=')) {
    return { valid: false, reason: 'equals sign' };
  }
  if (key.length > limit) {
    return { valid: false, reason: 'exceeds maximum length' };
  }
  return { valid: true };
}

/**
 * Attempts to parse inline empty structures like {}, [], or ().
 * Returns null if the text doesn't match an empty structure pattern.
 */
export function parseInlineEmpty(text: string): NeslValue | null {
  const trimmed = text.trim();
  if (trimmed === '{}' || /^{\s*}$/.test(trimmed)) return {};
  if (trimmed === '[]' || /^\[\s*\]$/.test(trimmed)) return [];
  if (trimmed === '()' || /^\(\s*\)$/.test(trimmed)) return '';
  return null;
}

/**
 * Generates a 5-line context window around a target line.
 * Pure function version that accepts the lines array.
 */
export function getContext(lines: string[], lineIndex: number): string {
  const start = Math.max(0, lineIndex - 2);
  const end = Math.min(lines.length, start + 5);
  return lines.slice(start, end).join('\n');
}