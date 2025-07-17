import type { ErrorCode } from '../types.js';
import { State } from '../types.js';

/**
 * Human-readable error messages for each error code.
 * Used in parseString() error handling.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  'string_unterminated': 'String literal starting with {open} was not closed with {close} on the same line',
  'string_not_found': 'Expected string literal',
  'invalid_string_start': 'String literal must start with opening delimiter',
  'content_after_string': 'Non-whitespace content found after string literal closing delimiter',
  'string_not_at_value_position': 'String literal not at value position',
  'delimiter_mismatch': 'Delimiter mismatch',
  'invalid_context': 'Invalid context',
  'invalid_key': 'Invalid key',
  'missing_block_wrapper': 'Missing block wrapper',
  'content_between_closing_and_block_end': 'Content between closing and block end',
  'unclosed_structure': 'Unclosed structure',
  'unclosed_block': 'Unclosed block',
  'orphaned_closing_marker': 'Orphaned closing marker',
  'eof_unexpected': 'Unexpected end of file',
  'root_must_be_object': 'Root must be object',
  'max_depth_exceeded': 'Maximum depth exceeded',
  'duplicate_key': 'Duplicate key',
  'key_too_long': 'Key too long',
  'multiple_roots': 'Multiple roots',
  'inline_structure_not_allowed': 'Inline structure not allowed'
};

/**
 * Human-readable names for state machine states.
 * Used in EOF error messages.
 */
export const STATE_NAMES: Record<State, string> = {
  [State.OBJECT]: 'object',
  [State.ARRAY]: 'array',
  [State.MULTILINE]: 'multiline'
};

/**
 * Maps line classification types to human-readable descriptions.
 * Used in root validation error messages.
 */
export const TYPE_DESCRIPTIONS: Record<string, string> = {
  'array_start': 'array',
  'array_end': ']',
  'object_end': '}',
  'multiline_start': 'multiline',
  'multiline_end': ')',
  'assignment': 'assignment',
  'array_element': 'array element',
  'unknown': 'unknown syntax'
};