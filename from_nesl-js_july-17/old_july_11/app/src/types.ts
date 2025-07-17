// Core value types - everything is strings, objects, or arrays
export type NeslValue = string | NeslObject | NeslArray;
export type NeslObject = { [key: string]: NeslValue };
export type NeslArray = NeslValue[];

// Parser options for configurable syntax
export interface ParseOptions {
  stringOpen?: string;   // default: 'R"""pv('
  stringClose?: string;  // default: ')pv"""'
  blockStart?: string;   // default: '<<<<<<<<<nesl'
  blockEnd?: string;     // default: '=========nesl'
  maxKeyLength?: number; // default: 256
  maxValueLength?: number; // default: 1048576 (1MB)
}

export const defaultConfig: ParseOptions = {
  stringOpen: 'R"""pv(',
  stringClose: ')pv"""',
  blockStart: '<<<<<<<<<nesl',
  blockEnd: '=========nesl',
  maxKeyLength: 256,
  maxValueLength: 1048576
};

// Error codes from test cases
export type ErrorCode = 
  | 'string_unterminated'
  | 'string_not_found'
  | 'invalid_string_start'
  | 'string_not_at_value_position'
  | 'delimiter_mismatch'
  | 'invalid_context'
  | 'invalid_key'
  | 'content_after_string'
  | 'missing_block_wrapper'
  | 'content_between_closing_and_block_end'
  | 'unclosed_structure'
  | 'unclosed_block'
  | 'orphaned_closing_marker'
  | 'eof_unexpected'
  | 'root_must_be_object'
  | 'max_depth_exceeded'
  | 'duplicate_key'
  | 'key_too_long'
  | 'multiple_roots'
  | 'inline_structure_not_allowed';

export interface ParseError {
  line: number;      // 1-based, file-relative
  code: ErrorCode;
  message: string;
  content: string;   // the problematic line
  context: string;   // multiline: before\nTARGET\nafter
}

// Parser always returns both data and errors
export interface ParseResult {
  data: NeslValue[];    // successfully parsed blocks
  errors: ParseError[]; // all errors encountered
}

// Internal: State machine states
export enum State {
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  MULTILINE = 'MULTILINE'
}

// Internal: Block extraction result
export interface Block {
  content: string;
  startLine: number; // 1-based file line number where <<<<<<<<<nesl marker appears
}

// Internal: String parse result
export type StringResult = 
  | { success: true; value: string }
  | { success: false; error: ErrorCode };

// Internal: Line classification
export type LineType =
  | { type: 'assignment'; key: string; rest: string }
  | { type: 'array_element'; rest: string }
  | { type: 'object_start' }
  | { type: 'object_end' }
  | { type: 'array_start' }
  | { type: 'array_end' }
  | { type: 'multiline_start' }
  | { type: 'multiline_end' }
  | { type: 'blank' }
  | { type: 'unknown'; line: string };