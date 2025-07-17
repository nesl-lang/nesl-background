import type { 
  ParseResult, 
  ParseOptions, 
  ParseError,
  NeslValue,
  NeslObject,
  NeslArray,
  ErrorCode
} from '../types.js';
import { State } from '../types.js';
import { parseStringLiteral } from '../string-parser.js';
import { classifyLine } from '../line-classifier.js';
import { defaultConfig } from '../types.js';
import { isValidKey, parseInlineEmpty } from './value-parsers.js';
import { getContext } from '../block-extractor.js';
import { ERROR_MESSAGES, STATE_NAMES, TYPE_DESCRIPTIONS } from './parser-constants.js';

interface Context {
  state: State;
  value: NeslValue;
  currentKey?: string;  // Only used in OBJECT state for pending assignments
  seenKeys?: Map<string, number>;  // Only used in OBJECT state for duplicate detection
  startLine: number;  // Line where this structure started
}

/**
 * Parses a single NESL block's content into structured data.
 * Implements a state machine with explicit context stack for nested structures.
 * 
 * @param content - Block content without <<<<<<<<<nesl/=========nesl markers
 * @param startLine - Line number where block starts in original file (1-based)
 * @param options - Optional parser configuration
 * @returns Parsed data and any errors encountered
 */
export function parseBlock(
  content: string, 
  startLine: number,
  fileLines: string[],
  options?: ParseOptions
): ParseResult {
  const config = { ...defaultConfig, ...options };
  const lines = content.split('\n');
  const errors: ParseError[] = [];
  const contextStack: Context[] = [];
  const trace: string[] = [];
  
  // Helper to get current line number (file-relative)
  // startLine is the marker line, content starts on the next line
  const getLineNumber = (contentLineIndex: number) => startLine + contentLineIndex + 1;
  
  // Helper to add error
  const addError = (
    lineIndex: number, 
    code: ErrorCode, 
    message: string
  ): void => {
    const fileLine = getLineNumber(lineIndex);
    errors.push({
      line: fileLine,
      code,
      message,
      content: lineIndex < lines.length ? lines[lineIndex] : '',
      context: getContext(fileLines, fileLine - 1) // Convert to 0-based index
    });
  };
  
  // Helper to parse string value
  const parseString = (
    text: string, 
    lineIndex: number
  ): string | null => {
    const result = parseStringLiteral(text, config.stringOpen, config.stringClose);
    if (!result.success) {
      let message = ERROR_MESSAGES[result.error] || 'String parsing error';
      // Replace placeholders for string_unterminated
      if (result.error === 'string_unterminated') {
        message = message.replace('{open}', config.stringOpen!).replace('{close}', config.stringClose!);
      }
      
      addError(lineIndex, result.error, message);
      return null;
    }
    return result.value;
  };
 
  
  // Process each line
  let i = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 1000; // Safety limit
  
  while (i < lines.length) {
    if (++iterations > MAX_ITERATIONS) {
      console.error(`INFINITE LOOP DETECTED at line ${i}/${lines.length}`);
      console.error(`Current line: "${lines[i]}"`);
      console.error(`Context stack:`, contextStack.map(c => c.state));
      throw new Error('Parser infinite loop detected');
    }
    const line = lines[i];
    const classified = classifyLine(line);
    const currentContext = contextStack[contextStack.length - 1];
    
  
    
    // Handle blank lines - skip in all states
    if (classified.type === 'blank') {
      i++;
      continue;
    }
    
    // Check for root level constraints
    if (!currentContext) {
      // Special case: inline empty object at root
      if (classified.type === 'unknown') {
        const inlineEmpty = parseInlineEmpty(classified.line);
        if (inlineEmpty !== null && typeof inlineEmpty === 'object' && !Array.isArray(inlineEmpty)) {
          return { data: [inlineEmpty], errors };
        }
      }
      
      // Must start with object
      if (classified.type !== 'object_start') {
        addError(i, 'root_must_be_object', 
          `NESL blocks must contain a single root object. Found ${TYPE_DESCRIPTIONS[classified.type] || classified.type} instead`);
        return { data: [], errors };
      }
      
      // Start root object
      contextStack.push({
        state: State.OBJECT,
        value: {},
        seenKeys: new Map(),
        startLine: getLineNumber(i)
      });
      i++;
      continue;
    }
    
    // Max nesting depth check
    if (contextStack.length >= 100 && 
        ['object_start', 'array_start', 'multiline_start'].includes(classified.type)) {
      addError(i, 'max_depth_exceeded', 'Maximum nesting depth (100) exceeded');
      i++;
      continue;
    }
    
    // State-specific handling
    let shouldReturn = false;
    let returnValue: ParseResult | null = null;
    
    let result: ParseResult | null = null;
    
    switch (currentContext.state) {
      case State.OBJECT:
        result = handleObjectState();
        break;
      case State.ARRAY:
        result = handleArrayState();
        break;
      case State.MULTILINE:
        result = handleMultilineState();
        break;
    }
    
    if (result) return result;
    
    if (shouldReturn && returnValue) {
      return returnValue;
    }
    
    function handleObjectState(): ParseResult | null {
      const obj = currentContext.value as NeslObject;
      
      switch (classified.type) {
        case 'assignment': {
          const { key, rest } = classified;
          
          // Validate key
          const keyCheck = isValidKey(key, config.maxKeyLength);
          if (!keyCheck.valid) {
            addError(i, 'invalid_key', 
              keyCheck.reason === 'exceeds maximum length' 
                ? `Key exceeds maximum length of ${config.maxKeyLength} characters`
                : `Key contains invalid characters (${keyCheck.reason})`);
            i++;
            return;
          }
          
          // Check for duplicate
          if (currentContext.seenKeys!.has(key)) {
            const originalLine = currentContext.seenKeys!.get(key)!;
            addError(i, 'duplicate_key', 
              `Duplicate key '${key}' (previously defined on line ${originalLine})`);
          }
          currentContext.seenKeys!.set(key, getLineNumber(i));
          
          // Parse value
          const trimmedRest = rest.trim();
          
          // Check for empty assignment
          if (!trimmedRest) {
            addError(i, 'invalid_context', 'Assignment requires value on same line');
            i++;
            return;
          }
          
          // Check for structure starts
          if (trimmedRest === '{') {
            contextStack.push({
              state: State.OBJECT,
              value: {},
              seenKeys: new Map(),
              startLine: getLineNumber(i)
            });
            currentContext.currentKey = key;  // Keep key on parent for assignment
            i++;
            return;
          }
          
          if (trimmedRest === '[') {
            contextStack.push({
              state: State.ARRAY,
              value: [],
              startLine: getLineNumber(i)
            });
            currentContext.currentKey = key;  // Keep key on parent for assignment
            i++;
            return;
          }
          
          if (trimmedRest === '(') {
            contextStack.push({
              state: State.MULTILINE,
              value: [],
              startLine: getLineNumber(i)
            });
            currentContext.currentKey = key;  // Keep key on parent for assignment
            i++;
            return;
          }
          
          // Check for inline empty structures
          const inlineEmpty = parseInlineEmpty(trimmedRest);
          if (inlineEmpty !== null) {
            obj[key] = inlineEmpty;
            i++;
            return;
          }
          
          // Must be a string literal
          const value = parseString(trimmedRest, i);
          if (value !== null) {
            obj[key] = value;
          }
          i++;
          return;
        }
        
        case 'object_end': {
          // Complete current object
          if (contextStack.length === 1) {
            // Root object complete - save it before popping
            const rootObject = obj;
            contextStack.pop();
            i++;
            
            // Skip any trailing blank lines
            while (i < lines.length && lines[i].trim() === '') {
              i++;
            }
            
            // If we have more content, that's an error
            if (i < lines.length) {
              addError(i, 'multiple_roots', 'Only one root object allowed per block');
              shouldReturn = true;
              returnValue = { data: [], errors };
              return;
            }
            
            // All good - return the completed object
            shouldReturn = true;
            returnValue = { data: [rootObject], errors };
            return;
          }
          
          // Pop and assign to parent
          contextStack.pop();
          const parent = contextStack[contextStack.length - 1];
          
          if (parent.state === State.OBJECT && parent.currentKey) {
            (parent.value as NeslObject)[parent.currentKey] = obj;
            delete parent.currentKey;
          } else if (parent.state === State.ARRAY) {
            (parent.value as NeslArray).push(obj);
          }
          
          i++;
          return;
        }
        
        case 'array_element':
          addError(i, 'invalid_context', 'Array element syntax not allowed in object context');
          i++;
          return;
          
        case 'unknown':
          // Check if it's a string literal
          if (classified.line.trim().startsWith(config.stringOpen!)) {
            addError(i, 'invalid_context', 'String literal not allowed without assignment in object context');
          } else {
            addError(i, 'invalid_context', `Invalid syntax in object context: ${classified.line}`);
          }
          i++;
          return;
          
        case 'array_end':
        case 'multiline_end':
          addError(i, 'delimiter_mismatch', `Expected } but found ${classified.type === 'array_end' ? ']' : ')'}`);
          // Recover by closing current structure
          if (contextStack.length > 1) {
            contextStack.pop();
            const parent = contextStack[contextStack.length - 1];
            if (parent.state === State.OBJECT && parent.currentKey) {
              (parent.value as NeslObject)[parent.currentKey] = obj;
              delete parent.currentKey;
            } else if (parent.state === State.ARRAY) {
              (parent.value as NeslArray).push(obj);
            }
          }
          i++;
          return;
          
        default:
          addError(i, 'invalid_context', `Unexpected ${classified.type} in object context`);
          i++;
          return null;
      }
      
      return null;
    }
    
    function handleArrayState(): ParseResult | null {
      const arr = currentContext.value as NeslArray;
      
      switch (classified.type) {
        case 'array_element': {
          const { rest } = classified;
          const trimmedRest = rest.trim();
          
          // Check for structure starts
          if (trimmedRest === '{') {
            contextStack.push({
              state: State.OBJECT,
              value: {},
              seenKeys: new Map(),
              startLine: getLineNumber(i)
            });
            i++;
            return;
          }
          
          if (trimmedRest === '[') {
            contextStack.push({
              state: State.ARRAY,
              value: [],
              startLine: getLineNumber(i)
            });
            i++;
            return;
          }
          
          // Note: Multiline in array doesn't use assignment syntax
          if (trimmedRest === '(') {
            contextStack.push({
              state: State.MULTILINE,
              value: [],
              startLine: getLineNumber(i)
            });
            i++;
            return;
          }
          
          // Check for inline empty structures
          const inlineEmpty = parseInlineEmpty(trimmedRest);
          if (inlineEmpty !== null) {
            arr.push(inlineEmpty);
            i++;
            return;
          }
          
          // Must be a string literal
          const value = parseString(trimmedRest, i);
          if (value !== null) {
            arr.push(value);
          }
          i++;
          return;
        }
        
        case 'array_end': {
          // Complete current array
          if (contextStack.length === 1) {
            // Can't have root array - but this shouldn't happen
            i++; // Increment to avoid infinite loop
            shouldReturn = true;
            returnValue = { data: [], errors };
            return;
          }
          
          // Pop and assign to parent
          contextStack.pop();
          const parent = contextStack[contextStack.length - 1];
          
          trace.push(`L${i}: pop ARRAY (${arr.length} items), parent=${parent?.state} key="${parent?.currentKey}"`);
          
          if (parent && parent.state === State.OBJECT && parent.currentKey) {
            trace.push(`L${i}: assigning array to obj["${parent.currentKey}"]`);
            (parent.value as NeslObject)[parent.currentKey] = arr;
            delete parent.currentKey;
          } else if (parent && parent.state === State.ARRAY) {
            (parent.value as NeslArray).push(arr);
          } else {
            trace.push(`L${i}: WARNING - no parent or currentKey for array assignment`);
          }
          
          i++;
          return;
        }
        
        case 'assignment':
          addError(i, 'invalid_context', 'Assignment syntax not allowed in array context');
          i++;
          return;
          
        case 'unknown':
          if (classified.line.trim().startsWith(config.stringOpen!)) {
            addError(i, 'invalid_context', 'String literal must follow array element syntax (-) in array context');
          } else {
            addError(i, 'invalid_context', `Invalid syntax in array context: ${classified.line}`);
          }
          i++;
          return;
          
        case 'object_end':
        case 'multiline_end':
          addError(i, 'delimiter_mismatch', `Expected ] but found ${classified.type === 'object_end' ? '}' : ')'}`);
          // Recover by closing current structure
          if (contextStack.length > 1) {
            contextStack.pop();
            const parent = contextStack[contextStack.length - 1];
            if (parent.state === State.OBJECT && parent.currentKey) {
              (parent.value as NeslObject)[parent.currentKey] = arr;
              delete parent.currentKey;
            } else if (parent.state === State.ARRAY) {
              (parent.value as NeslArray).push(arr);
            }
          }
          i++;
          return;
          
        default:
          addError(i, 'invalid_context', `Unexpected ${classified.type} in array context`);
          i++;
          return null;
      }
      
      return null;
    }
    
    function handleMultilineState(): ParseResult | null {
      const parts = currentContext.value as string[];
      
      switch (classified.type) {
        case 'multiline_end': {
          // Join accumulated strings
          const joined = parts.join('\n');
          
          // Pop and assign to parent
          contextStack.pop();
          const parent = contextStack[contextStack.length - 1];
          
          if (parent.state === State.OBJECT && parent.currentKey) {
            (parent.value as NeslObject)[parent.currentKey] = joined;
            delete parent.currentKey;
          } else if (parent.state === State.ARRAY) {
            (parent.value as NeslArray).push(joined);
          }
          
          i++;
          return;
        }
        
        case 'unknown': {
          // Should be a string literal
          const trimmed = classified.line.trim();
          if (trimmed.startsWith(config.stringOpen!)) {
            const value = parseString(trimmed, i);
            if (value !== null) {
              parts.push(value);
            }
          } else {
            addError(i, 'invalid_context', 'Only string literals allowed in multiline context');
          }
          i++;
          return;
        }
        
        case 'assignment':
          addError(i, 'invalid_context', 'Assignment syntax not allowed in multiline context');
          i++;
          return;
          
        case 'array_element':
          addError(i, 'invalid_context', 'Array element syntax not allowed in multiline context');
          i++;
          return;
          
        case 'object_start':
        case 'array_start':
        case 'multiline_start':
          addError(i, 'invalid_context', 'Only string literals allowed in multiline context');
          i++;
          return;
          
        case 'object_end':
        case 'array_end':
          addError(i, 'delimiter_mismatch', `Expected ) but found ${classified.type === 'object_end' ? '}' : ']'}`);
          // Recover by closing multiline
          const joined = parts.join('\n');
          contextStack.pop();
          const parent = contextStack[contextStack.length - 1];
          if (parent && parent.state === State.OBJECT && parent.currentKey) {
            (parent.value as NeslObject)[parent.currentKey] = joined;
            delete parent.currentKey;
          } else if (parent && parent.state === State.ARRAY) {
            (parent.value as NeslArray).push(joined);
          }
          i++;
          return;
          
        default:
          addError(i, 'invalid_context', `Unexpected ${classified.type} in multiline context`);
          i++;
          return null;
      }
      
      return null;
    }
  }
  
  // Check for EOF with unclosed structures
  if (contextStack.length > 0) {
    const current = contextStack[contextStack.length - 1];
    errors.push({
      line: getLineNumber(lines.length),
      code: 'eof_unexpected',
      message: `Unexpected end of file (expected closing delimiter for ${STATE_NAMES[current.state]})`,
      content: '',
      context: lines.slice(-5).join('\n')
    });
    
    // Return empty result on unclosed structures
    return { data: [], errors };
  }
  
  // No data if we never started
  return { data: [], errors };
}