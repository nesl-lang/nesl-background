/** 0-based UTF-16 code unit index within a line */
export type CharIndex = number;

/** 1-based column number for display (UTF-16 code units) */
export type Column = number;

/** 1-based line number */
export type LineNumber = number;

export interface Block {
  id: string;
  properties: Record<string, string>;
  startLine: LineNumber;
  endLine: LineNumber | null;
}

export interface ParseError {
  code: string;
  line: LineNumber;
  column: Column;
  length: number;
  blockId: string | null;
  content: string;
  context: string;
  message: string;
}

export interface ParseResult {
  blocks: Block[];
  errors: ParseError[];
}

export type AssignmentResult = 
  | { success: true; type: 'key-value'; key: string; value: string }
  | { success: true; type: 'heredoc'; key: string; delimiter: string }
  | { success: false; error: {
      code: 'EMPTY_KEY' | 'INVALID_OPERATOR' | 'UNCLOSED_QUOTE' | 
            'INVALID_VALUE' | 'TRAILING_CONTENT' | 'MALFORMED_ASSIGNMENT';
      position: CharIndex;
      length: number;
    }};

export type LineType = 'header' | 'end_marker' | 'assignment' | 'empty' | 'unknown';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface HeaderResult {
  isValid: boolean;
  blockId?: string;
}

export interface EndMarkerResult {
  isEnd: boolean;
  blockId?: string;
}