______________________________ unit/block-extraction/001_single_block.json
```json
{
  "blocks": [
    {
      "content": "{\n  key = R\"\"\"pv(value)pv\"\"\"\n}",
      "startLine": 3
    }
  ],
  "errors": []
}
```
______________________________ unit/block-extraction/001_single_block.nesl
```nesl
Some text before the block

<<<<<<<<<nesl
{
  key = R"""pv(value)pv"""
}
=========nesl

Text after the block
```
______________________________ unit/block-extraction/002_multiple_blocks.json
```json
{
  "blocks": [
    {
      "content": "{\n  first = R\"\"\"pv(block)pv\"\"\"\n}",
      "startLine": 1
    },
    {
      "content": "[\n  - R\"\"\"pv(second block)pv\"\"\"\n]",
      "startLine": 11
    },
    {
      "content": "{\n  third = {\n    nested = R\"\"\"pv(value)pv\"\"\"\n  }\n}",
      "startLine": 19
    }
  ],
  "errors": []
}
```
______________________________ unit/block-extraction/002_multiple_blocks.nesl
```nesl
<<<<<<<<<nesl
{
  first = R"""pv(block)pv"""
}
=========nesl

Random text
Multiple lines
Between blocks

<<<<<<<<<nesl
[
  - R"""pv(second block)pv"""
]
=========nesl

More text after

<<<<<<<<<nesl
{
  third = {
    nested = R"""pv(value)pv"""
  }
}
=========nesl
```
______________________________ unit/block-extraction/003_unclosed_block.json
```json
{
  "blocks": [],
  "errors": [
    {
      "line": 1,
      "code": "unclosed_block",
      "message": "Block starting at line 1 was not closed with =========nesl",
      "context": "<<<<<<<<<nesl\n{\n  key = R\"\"\"pv(value)pv\"\"\"\n  nested = {\n    inner = R\"\"\"pv(never closes)pv\"\"\""
    }
  ]
}
```
______________________________ unit/block-extraction/003_unclosed_block.nesl
```nesl
<<<<<<<<<nesl
{
  key = R"""pv(value)pv"""
  nested = {
    inner = R"""pv(never closes)pv"""
  }
```
______________________________ unit/block-extraction/004_orphaned_closing_marker.json
```json
{
  "blocks": [],
  "errors": [
    {
      "line": 6,
      "code": "orphaned_closing_marker",
      "message": "Found =========nesl without matching <<<<<<<<<nesl",
      "context": "  key = R\"\"\"pv(looks like NESL but no opening marker)pv\"\"\"\n}\n=========nesl\n\nThis should error"
    }
  ]
}
```
______________________________ unit/block-extraction/004_orphaned_closing_marker.nesl
```nesl
Some initial text

{
  key = R"""pv(looks like NESL but no opening marker)pv"""
}
=========nesl

This should error
```
______________________________ unit/block-extraction/005_nested_block_markers.json
```json
{
  "blocks": [
    {
      "content": "{\n  start_marker = R\"\"\"pv(contains <<<<<<<<<nesl in text)pv\"\"\"\n  end_marker = R\"\"\"pv(has =========nesl inside)pv\"\"\"\n  both = R\"\"\"pv(<<<<<<<<<nesl and =========nesl together)pv\"\"\"\n}",
      "startLine": 1
    }
  ],
  "errors": []
}
```
______________________________ unit/block-extraction/005_nested_block_markers.nesl
```nesl
<<<<<<<<<nesl
{
  start_marker = R"""pv(contains <<<<<<<<<nesl in text)pv"""
  end_marker = R"""pv(has =========nesl inside)pv"""
  both = R"""pv(<<<<<<<<<nesl and =========nesl together)pv"""
}
=========nesl
```
______________________________ unit/block-extraction/006_custom_markers.json
```json
{
  "config": {
    "blockStart": "<<<START>>>",
    "blockEnd": "===END==="
  },
  "blocks": [
    {
      "content": "{\n  key = R\"\"\"pv(custom markers)pv\"\"\"\n}",
      "startLine": 1
    },
    {
      "content": "[\n  - R\"\"\"pv(second block)pv\"\"\"\n]",
      "startLine": 9
    }
  ],
  "errors": []
}
```
______________________________ unit/block-extraction/006_custom_markers.nesl
```nesl
<<<START>>>
{
  key = R"""pv(custom markers)pv"""
}
===END===

Text between

<<<START>>>
[
  - R"""pv(second block)pv"""
]
===END===
```
______________________________ unit/block-parser/basics/001_empty_object.json
```json
[
  {}
]
```
______________________________ unit/block-parser/basics/001_empty_object.nesl
```nesl
<<<<<<<<<nesl
{}
=========nesl
```
______________________________ unit/block-parser/basics/002_single_key.json
```json
[
  {
    "key": "value"
  }
]
```
______________________________ unit/block-parser/basics/002_single_key.nesl
```nesl
<<<<<<<<<nesl
{
  key = R"""pv(value)pv"""
}
=========nesl
```
______________________________ unit/block-parser/basics/003_multiple_keys.json
```json
[
  {
    "first": "value one",
    "second": "value two",
    "third": "value three"
  }
]
```
______________________________ unit/block-parser/basics/003_multiple_keys.nesl
```nesl
<<<<<<<<<nesl
{
  first = R"""pv(value one)pv"""
  second = R"""pv(value two)pv"""
  third = R"""pv(value three)pv"""
}
=========nesl
```
______________________________ unit/block-parser/basics/004_single_key.json
```json
[
  {
    "key": "value"
  }
]
```
______________________________ unit/block-parser/basics/004_single_key.nesl
```nesl
<<<<<<<<<nesl
{
  key = R"""pv(value)pv"""
}
=========nesl
```
______________________________ unit/block-parser/basics/005_array_value.json
```json
[
  {
    "items": ["first item", "second item"]
  }
]
```
______________________________ unit/block-parser/basics/005_array_value.nesl
```nesl
<<<<<<<<<nesl
{
  items = [
    - R"""pv(first item)pv"""
    - R"""pv(second item)pv"""
  ]
}
=========nesl
```
______________________________ unit/block-parser/basics/006_multiline_value.json
```json
[
  {
    "message": "line one\nline two\nline three"
  }
]
```
______________________________ unit/block-parser/basics/006_multiline_value.nesl
```nesl
<<<<<<<<<nesl
{
  message = (
    R"""pv(line one)pv"""
    R"""pv(line two)pv"""
    R"""pv(line three)pv"""
  )
}
=========nesl
```
______________________________ unit/block-parser/basics/007_mixed_values.json
```json
[
  {
    "name": "test object",
    "nested": {
      "inner": "nested value"
    },
    "list": ["item"],
    "multi": "first\nsecond"
  }
]
```
______________________________ unit/block-parser/basics/007_mixed_values.nesl
```nesl
<<<<<<<<<nesl
{
  name = R"""pv(test object)pv"""
  nested = {
    inner = R"""pv(nested value)pv"""
  }
  list = [
    - R"""pv(item)pv"""
  ]
  multi = (
    R"""pv(first)pv"""
    R"""pv(second)pv"""
  )
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/001_duplicate_keys.json
```json
{
  "errors": [
    {
      "line": 4,
      "code": "duplicate_key",
      "message": "Duplicate key 'key' (previously defined on line 3)",
      "content": "  key = R\"\"\"pv(second)pv\"\"\"",
      "context": "{\n  key = R\"\"\"pv(first)pv\"\"\"\n  key = R\"\"\"pv(second)pv\"\"\"\n  other = R\"\"\"pv(value)pv\"\"\"\n  key = R\"\"\"pv(third)pv\"\"\""
    },
    {
      "line": 6,
      "code": "duplicate_key",
      "message": "Duplicate key 'key' (previously defined on line 4)",
      "content": "  key = R\"\"\"pv(third)pv\"\"\"",
      "context": "  key = R\"\"\"pv(second)pv\"\"\"\n  other = R\"\"\"pv(value)pv\"\"\"\n  key = R\"\"\"pv(third)pv\"\"\"\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/edge-cases/001_duplicate_keys.nesl
```nesl
<<<<<<<<<nesl
{
  key = R"""pv(first)pv"""
  key = R"""pv(second)pv"""
  other = R"""pv(value)pv"""
  key = R"""pv(third)pv"""
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/002_whitespace_only_multiline.json
```json
[
  {
    "text": "line 1\nline 2\nline 3"
  }
]
```
______________________________ unit/block-parser/edge-cases/002_whitespace_only_multiline.nesl
```nesl
<<<<<<<<<nesl
{
  text = (
    R"""pv(line 1)pv"""
    
    R"""pv(line 2)pv"""
        
    R"""pv(line 3)pv"""
  )
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/003_unicode_keys.json
```json
[
  {
    "café": "coffee",
    "日本語": "Japanese",
    "🚀": "rocket"
  }
]
```
______________________________ unit/block-parser/edge-cases/003_unicode_keys.nesl
```nesl
<<<<<<<<<nesl
{
  café = R"""pv(coffee)pv"""
  日本語 = R"""pv(Japanese)pv"""
  🚀 = R"""pv(rocket)pv"""
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/004_long_key_at_limit.json
```json
[
  {
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567": "256 chars exactly"
  }
]
```
______________________________ unit/block-parser/edge-cases/004_long_key_at_limit.nesl
```nesl
<<<<<<<<<nesl
{
  abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567 = R"""pv(256 chars exactly)pv"""
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/005_key_over_limit.json
```json
{
  "errors": [
    {
      "line": 3,
      "code": "key_too_long",
      "message": "Key exceeds maximum length of 256 characters",
      "content": "  abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678 = R\"\"\"pv(257 chars)pv\"\"\"",
      "context": "<<<<<<<<<nesl\n{\n  abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678 = R\"\"\"pv(257 chars)pv\"\"\"\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/edge-cases/005_key_over_limit.nesl
```nesl
<<<<<<<<<nesl
{
  abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678 = R"""pv(257 chars)pv"""
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/006_custom_delimiters.json
```json
{
  "config": {
    "blockStart": "<<<START>>>",
    "blockEnd": "===END===",
    "stringOpen": "%%%[",
    "stringClose": "]%%%"
  },
  "expected": [
    {
      "key": "custom string"
    }
  ],
  "errors": []
}
```
______________________________ unit/block-parser/edge-cases/006_custom_delimiters.nesl
```nesl
<<<START>>>
{
  key = %%%[custom string]%%%
}
===END===
```
______________________________ unit/block-parser/edge-cases/007_unclosed_at_eof.json
```json
{
  "errors": [
    {
      "line": 6,
      "code": "eof_unexpected",
      "message": "Unexpected end of file (expected closing delimiter for array)",
      "content": "",
      "context": "{\n  nested = {\n    deep = [\n      - R\"\"\"pv(never closed)pv\"\"\"\n"
    }
  ]
}
```
______________________________ unit/block-parser/edge-cases/007_unclosed_at_eof.nesl
```nesl
<<<<<<<<<nesl
{
  nested = {
    deep = [
      - R"""pv(never closed)pv"""
```
______________________________ unit/block-parser/edge-cases/010_no_space_assignment.json
```json
[
  {
    "key": "value",
    "another": "test"
  }
]
```
______________________________ unit/block-parser/edge-cases/010_no_space_assignment.nesl
```nesl
<<<<<<<<<nesl
{
  key=R"""pv(value)pv"""
  another=R"""pv(test)pv"""
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/011_array_spacing_variations.json
```json
[
  {
    "items": ["no space", "multiple spaces", "single space"]
  }
]
```
______________________________ unit/block-parser/edge-cases/011_array_spacing_variations.nesl
```nesl
<<<<<<<<<nesl
{
  items = [
    -R"""pv(no space)pv"""
    -    R"""pv(multiple spaces)pv"""
    - R"""pv(single space)pv"""
  ]
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/012_empty_structures_with_space.json
```json
[
  {
    "single": {},
    "multiple": {},
    "array": [],
    "multi": ""
  }
]
```
______________________________ unit/block-parser/edge-cases/012_empty_structures_with_space.nesl
```nesl
<<<<<<<<<nesl
{
  single = { }
  multiple = {    }
  array = [  ]
  multi = (     )
}
=========nesl
```
______________________________ unit/block-parser/edge-cases/013_trailing_spaces_after_closing.json
```json
[
  {
    "key": "value"
  }
]
```
______________________________ unit/block-parser/edge-cases/013_trailing_spaces_after_closing.nesl
```nesl
<<<<<<<<<nesl
{
  key = R"""pv(value)pv"""
}   
=========nesl
```
______________________________ unit/block-parser/nesting/001_object_in_object.json
```json
[
  {
    "outer": {
      "inner": "nested value",
      "deep": {
        "deeper": "two levels"
      }
    }
  }
]
```
______________________________ unit/block-parser/nesting/001_object_in_object.nesl
```nesl
<<<<<<<<<nesl
{
  outer = {
    inner = R"""pv(nested value)pv"""
    deep = {
      deeper = R"""pv(two levels)pv"""
    }
  }
}
=========nesl
```
______________________________ unit/block-parser/nesting/002_array_in_object.json
```json
[
  {
    "items": ["first", "second"],
    "nested": {
      "list": ["inner item"]
    }
  }
]
```
______________________________ unit/block-parser/nesting/002_array_in_object.nesl
```nesl
<<<<<<<<<nesl
{
  items = [
    - R"""pv(first)pv"""
    - R"""pv(second)pv"""
  ]
  nested = {
    list = [
      - R"""pv(inner item)pv"""
    ]
  }
}
=========nesl
```
______________________________ unit/block-parser/nesting/003_multiline_in_object.json
```json
[
  {
    "description": "line 1\nline 2",
    "nested": {
      "text": "nested multiline"
    }
  }
]
```
______________________________ unit/block-parser/nesting/003_multiline_in_object.nesl
```nesl
<<<<<<<<<nesl
{
  description = (
    R"""pv(line 1)pv"""
    R"""pv(line 2)pv"""
  )
  nested = {
    text = (
      R"""pv(nested multiline)pv"""
    )
  }
}
=========nesl
```
______________________________ unit/block-parser/nesting/004_object_in_array.json
```json
[
  {
    "items": [
      {
        "id": "1",
        "name": "first"
      },
      {
        "id": "2",
        "name": "second"
      }
    ]
  }
]
```
______________________________ unit/block-parser/nesting/004_object_in_array.nesl
```nesl
<<<<<<<<<nesl
{
  items = [
    - {
      id = R"""pv(1)pv"""
      name = R"""pv(first)pv"""
    }
    - {
      id = R"""pv(2)pv"""
      name = R"""pv(second)pv"""
    }
  ]
}
=========nesl
```
______________________________ unit/block-parser/nesting/005_array_in_array.json
```json
[
  {
    "matrix": [
      ["1,1", "1,2"],
      ["2,1", "2,2"]
    ]
  }
]
```
______________________________ unit/block-parser/nesting/005_array_in_array.nesl
```nesl
<<<<<<<<<nesl
{
  matrix = [
    - [
      - R"""pv(1,1)pv"""
      - R"""pv(1,2)pv"""
    ]
    - [
      - R"""pv(2,1)pv"""
      - R"""pv(2,2)pv"""
    ]
  ]
}
=========nesl
```
______________________________ unit/block-parser/nesting/006_multiline_in_array.json
```json
[
  {
    "items": [
      "line 1\nline 2",
      "regular string"
    ]
  }
]
```
______________________________ unit/block-parser/nesting/006_multiline_in_array.nesl
```nesl
<<<<<<<<<nesl
{
  items = [
    - (
      R"""pv(line 1)pv"""
      R"""pv(line 2)pv"""
    )
    - R"""pv(regular string)pv"""
  ]
}
=========nesl
```
______________________________ unit/block-parser/nesting/007_mixed_deep_nesting.json
```json
[
  {
    "data": [
      {
        "info": {
          "items": [
            {
              "value": "deep"
            }
          ]
        }
      }
    ]
  }
]
```
______________________________ unit/block-parser/nesting/007_mixed_deep_nesting.nesl
```nesl
<<<<<<<<<nesl
{
  data = [
    - {
      info = {
        items = [
          - {
            value = R"""pv(deep)pv"""
          }
        ]
      }
    }
  ]
}
=========nesl
```
______________________________ unit/block-parser/nesting/008_max_nesting_depth.json
```json
[
  {
    "l1": {
      "l2": {
        "l3": {
          "l4": {
            "l5": "depth 5 - would need 95 more levels to hit limit"
          }
        }
      }
    }
  }
]
```
______________________________ unit/block-parser/nesting/008_max_nesting_depth.nesl
```nesl
<<<<<<<<<nesl
{
  l1 = {
    l2 = {
      l3 = {
        l4 = {
          l5 = R"""pv(depth 5 - would need 95 more levels to hit limit)pv"""
        }
      }
    }
  }
}
=========nesl
```
______________________________ unit/block-parser/nesting/009_max_nesting_exceeded.json
```json
[
  {
    "note": "This would need 101 levels to trigger max_depth_exceeded",
    "deep": {
      "nested": {
        "structure": "Parser should track depth via context stack"
      }
    }
  }
]
```
______________________________ unit/block-parser/nesting/009_max_nesting_exceeded.nesl
```nesl
<<<<<<<<<nesl
{
  note = R"""pv(This would need 101 levels to trigger max_depth_exceeded)pv"""
  deep = {
    nested = {
      structure = R"""pv(Parser should track depth via context stack)pv"""
    }
  }
}
=========nesl
```
______________________________ unit/block-parser/recovery/001_invalid_key_recovery.json
```json
{
  "errors": [
    {
      "line": 4,
      "code": "invalid_key",
      "message": "Key contains invalid characters (whitespace)",
      "content": "  bad key = R\"\"\"pv(space in key)pv\"\"\"",
      "context": "{\n  valid1 = R\"\"\"pv(before error)pv\"\"\"\n  bad key = R\"\"\"pv(space in key)pv\"\"\"\n  valid2 = R\"\"\"pv(after error)pv\"\"\"\n  key=bad = R\"\"\"pv(equals in key)pv\"\"\""
    },
    {
      "line": 6,
      "code": "invalid_key",
      "message": "Key contains invalid characters (equals sign)",
      "content": "  key=bad = R\"\"\"pv(equals in key)pv\"\"\"",
      "context": "  bad key = R\"\"\"pv(space in key)pv\"\"\"\n  valid2 = R\"\"\"pv(after error)pv\"\"\"\n  key=bad = R\"\"\"pv(equals in key)pv\"\"\"\n  valid3 = R\"\"\"pv(continues parsing)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/recovery/001_invalid_key_recovery.nesl
```nesl
<<<<<<<<<nesl
{
  valid1 = R"""pv(before error)pv"""
  bad key = R"""pv(space in key)pv"""
  valid2 = R"""pv(after error)pv"""
  key=bad = R"""pv(equals in key)pv"""
  valid3 = R"""pv(continues parsing)pv"""
}
=========nesl
```
______________________________ unit/block-parser/recovery/002_string_error_recovery.json
```json
{
  "errors": [
    {
      "line": 4,
      "code": "string_unterminated",
      "message": "String literal starting with R\"\"\"pv( was not closed with )pv\"\"\" on the same line",
      "content": "  unterminated = R\"\"\"pv(missing close",
      "context": "{\n  valid1 = R\"\"\"pv(ok)pv\"\"\"\n  unterminated = R\"\"\"pv(missing close\n  valid2 = R\"\"\"pv(continues)pv\"\"\"\n  extra = R\"\"\"pv(ok)pv\"\"\" garbage after"
    },
    {
      "line": 6,
      "code": "content_after_string",
      "message": "Non-whitespace content found after string literal closing delimiter",
      "content": "  extra = R\"\"\"pv(ok)pv\"\"\" garbage after",
      "context": "  unterminated = R\"\"\"pv(missing close\n  valid2 = R\"\"\"pv(continues)pv\"\"\"\n  extra = R\"\"\"pv(ok)pv\"\"\" garbage after\n  valid3 = R\"\"\"pv(still parsing)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/recovery/002_string_error_recovery.nesl
```nesl
<<<<<<<<<nesl
{
  valid1 = R"""pv(ok)pv"""
  unterminated = R"""pv(missing close
  valid2 = R"""pv(continues)pv"""
  extra = R"""pv(ok)pv""" garbage after
  valid3 = R"""pv(still parsing)pv"""
}
=========nesl
```
______________________________ unit/block-parser/recovery/003_nested_error_recovery.json
```json
{
  "errors": [
    {
      "line": 6,
      "code": "invalid_key",
      "message": "Key contains invalid characters (whitespace)",
      "content": "    bad key = R\"\"\"pv(error)pv\"\"\"",
      "context": "  nested = {\n    valid = R\"\"\"pv(inside)pv\"\"\"\n    bad key = R\"\"\"pv(error)pv\"\"\"\n    after = R\"\"\"pv(continues)pv\"\"\"\n  }"
    }
  ]
}
```
______________________________ unit/block-parser/recovery/003_nested_error_recovery.nesl
```nesl
<<<<<<<<<nesl
{
  before = R"""pv(ok)pv"""
  nested = {
    valid = R"""pv(inside)pv"""
    bad key = R"""pv(error)pv"""
    after = R"""pv(continues)pv"""
  }
  outside = R"""pv(parent continues)pv"""
}
=========nesl
```
______________________________ unit/block-parser/recovery/004_delimiter_mismatch_recovery.json
```json
{
  "errors": [
    {
      "line": 5,
      "code": "delimiter_mismatch",
      "message": "Expected ] but found }",
      "content": "  }",
      "context": "  array = [\n    - R\"\"\"pv(item)pv\"\"\"\n  }\n  after_mismatch = R\"\"\"pv(unreachable)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/recovery/004_delimiter_mismatch_recovery.nesl
```nesl
<<<<<<<<<nesl
{
  array = [
    - R"""pv(item)pv"""
  }
  after_mismatch = R"""pv(unreachable)pv"""
}
=========nesl
```
______________________________ unit/block-parser/recovery/005_multiple_errors_same_object.json
```json
{
  "errors": [
    {
      "line": 3,
      "code": "invalid_context",
      "message": "String literal not allowed without assignment in object context",
      "content": "  R\"\"\"pv(bare string)pv\"\"\"",
      "context": "<<<<<<<<<nesl\n{\n  R\"\"\"pv(bare string)pv\"\"\"\n  - R\"\"\"pv(dash in object)pv\"\"\"\n  empty ="
    },
    {
      "line": 4,
      "code": "invalid_context",
      "message": "Array element syntax not allowed in object context",
      "content": "  - R\"\"\"pv(dash in object)pv\"\"\"",
      "context": "{\n  R\"\"\"pv(bare string)pv\"\"\"\n  - R\"\"\"pv(dash in object)pv\"\"\"\n  empty =\n  bad key = R\"\"\"pv(space)pv\"\"\""
    },
    {
      "line": 5,
      "code": "invalid_context",
      "message": "Assignment requires value on same line",
      "content": "  empty =",
      "context": "  R\"\"\"pv(bare string)pv\"\"\"\n  - R\"\"\"pv(dash in object)pv\"\"\"\n  empty =\n  bad key = R\"\"\"pv(space)pv\"\"\"\n  valid = R\"\"\"pv(one valid key)pv\"\"\""
    },
    {
      "line": 6,
      "code": "invalid_key",
      "message": "Key contains invalid characters (whitespace)",
      "content": "  bad key = R\"\"\"pv(space)pv\"\"\"",
      "context": "  - R\"\"\"pv(dash in object)pv\"\"\"\n  empty =\n  bad key = R\"\"\"pv(space)pv\"\"\"\n  valid = R\"\"\"pv(one valid key)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/recovery/005_multiple_errors_same_object.nesl
```nesl
<<<<<<<<<nesl
{
  R"""pv(bare string)pv"""
  - R"""pv(dash in object)pv"""
  empty =
  bad key = R"""pv(space)pv"""
  valid = R"""pv(one valid key)pv"""
}
=========nesl
```
______________________________ unit/block-parser/state-errors/001_bare_string_in_object.json
```json
{
  "errors": [
    {
      "line": 4,
      "code": "invalid_context",
      "message": "String literal not allowed without assignment in object context",
      "content": "  R\"\"\"pv(this string has no key assignment)pv\"\"\"",
      "context": "{\n  valid = R\"\"\"pv(properly assigned)pv\"\"\"\n  R\"\"\"pv(this string has no key assignment)pv\"\"\"\n  another = R\"\"\"pv(valid again)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/state-errors/001_bare_string_in_object.nesl
```nesl
<<<<<<<<<nesl
{
  valid = R"""pv(properly assigned)pv"""
  R"""pv(this string has no key assignment)pv"""
  another = R"""pv(valid again)pv"""
}
=========nesl
```
______________________________ unit/block-parser/state-errors/002_assignment_in_array.json
```json
{
  "errors": [
    {
      "line": 5,
      "code": "invalid_context",
      "message": "Assignment syntax not allowed in array context",
      "content": "    key = R\"\"\"pv(invalid assignment)pv\"\"\"",
      "context": "  items = [\n    - R\"\"\"pv(valid)pv\"\"\"\n    key = R\"\"\"pv(invalid assignment)pv\"\"\"\n    - R\"\"\"pv(valid)pv\"\"\"\n  ]"
    }
  ]
}
```
______________________________ unit/block-parser/state-errors/002_assignment_in_array.nesl
```nesl
<<<<<<<<<nesl
{
  items = [
    - R"""pv(valid)pv"""
    key = R"""pv(invalid assignment)pv"""
    - R"""pv(valid)pv"""
  ]
}
=========nesl
```
______________________________ unit/block-parser/state-errors/003_dash_in_object.json
```json
{
  "errors": [
    {
      "line": 4,
      "code": "invalid_context",
      "message": "Array element syntax not allowed in object context",
      "content": "  - R\"\"\"pv(dash not allowed)pv\"\"\"",
      "context": "{\n  valid = R\"\"\"pv(ok)pv\"\"\"\n  - R\"\"\"pv(dash not allowed)pv\"\"\"\n  another = R\"\"\"pv(ok)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/state-errors/003_dash_in_object.nesl
```nesl
<<<<<<<<<nesl
{
  valid = R"""pv(ok)pv"""
  - R"""pv(dash not allowed)pv"""
  another = R"""pv(ok)pv"""
}
=========nesl
```
______________________________ unit/block-parser/state-errors/004_non_string_in_multiline.json
```json
{
  "errors": [
    {
      "line": 5,
      "code": "invalid_context",
      "message": "Only string literals allowed in multiline context",
      "content": "    {",
      "context": "  text = (\n    R\"\"\"pv(valid string)pv\"\"\"\n    {\n    R\"\"\"pv(another string)pv\"\"\"\n  )"
    }
  ]
}
```
______________________________ unit/block-parser/state-errors/004_non_string_in_multiline.nesl
```nesl
<<<<<<<<<nesl
{
  text = (
    R"""pv(valid string)pv"""
    {
    R"""pv(another string)pv"""
  )
}
=========nesl
```
______________________________ unit/block-parser/state-errors/005_assignment_in_multiline.json
```json
{
  "errors": [
    {
      "line": 5,
      "code": "invalid_context",
      "message": "Assignment syntax not allowed in multiline context",
      "content": "    key = R\"\"\"pv(no assignments here)pv\"\"\"",
      "context": "  text = (\n    R\"\"\"pv(valid)pv\"\"\"\n    key = R\"\"\"pv(no assignments here)pv\"\"\"\n    R\"\"\"pv(valid)pv\"\"\"\n  )"
    }
  ]
}
```
______________________________ unit/block-parser/state-errors/005_assignment_in_multiline.nesl
```nesl
<<<<<<<<<nesl
{
  text = (
    R"""pv(valid)pv"""
    key = R"""pv(no assignments here)pv"""
    R"""pv(valid)pv"""
  )
}
=========nesl
```
______________________________ unit/block-parser/state-errors/006_wrong_closing_delimiter.json
```json
{
  "errors": [
    {
      "line": 5,
      "code": "delimiter_mismatch",
      "message": "Expected ] but found }",
      "content": "  }",
      "context": "  array = [\n    - R\"\"\"pv(item)pv\"\"\"\n  }\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/state-errors/006_wrong_closing_delimiter.nesl
```nesl
<<<<<<<<<nesl
{
  array = [
    - R"""pv(item)pv"""
  }
}
=========nesl
```
______________________________ unit/block-parser/state-errors/007_empty_assignment.json
```json
{
  "errors": [
    {
      "line": 4,
      "code": "invalid_context", 
      "message": "Assignment requires value on same line",
      "content": "  empty =",
      "context": "{\n  valid = R\"\"\"pv(has value)pv\"\"\"\n  empty =\n  another = R\"\"\"pv(also valid)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/state-errors/007_empty_assignment.nesl
```nesl
<<<<<<<<<nesl
{
  valid = R"""pv(has value)pv"""
  empty =
  another = R"""pv(also valid)pv"""
}
=========nesl
```
______________________________ unit/block-parser/structure-errors/001_root_array.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found array instead",
      "content": "[",
      "context": "<<<<<<<<<nesl\n[\n]\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/001_root_array.nesl
```nesl
<<<<<<<<<nesl
[]
=========nesl
```
______________________________ unit/block-parser/structure-errors/002_root_multiline.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found multiline instead",
      "content": "(",
      "context": "<<<<<<<<<nesl\n(\n)\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/002_root_multiline.nesl
```nesl
<<<<<<<<<nesl
()
=========nesl
```
______________________________ unit/block-parser/structure-errors/003_root_string.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found string instead",
      "content": "R\"\"\"pv(bare string at root level)pv\"\"\"",
      "context": "<<<<<<<<<nesl\nR\"\"\"pv(bare string at root level)pv\"\"\"\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/003_root_string.nesl
```nesl
<<<<<<<<<nesl
R"""pv(bare string at root level)pv"""
=========nesl
```
______________________________ unit/block-parser/structure-errors/004_multiple_roots.json
```json
{
  "errors": [
    {
      "line": 5,
      "code": "multiple_roots",
      "message": "Only one root object allowed per block",
      "content": "{",
      "context": "  first = R\"\"\"pv(object one)pv\"\"\"\n}\n{\n  second = R\"\"\"pv(object two)pv\"\"\"\n}"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/004_multiple_roots.nesl
```nesl
<<<<<<<<<nesl
{
  first = R"""pv(object one)pv"""
}
{
  second = R"""pv(object two)pv"""
}
=========nesl
```
______________________________ unit/block-parser/structure-errors/005_root_dash.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found array element instead",
      "content": "- R\"\"\"pv(dash not allowed at root)pv\"\"\"",
      "context": "<<<<<<<<<nesl\n- R\"\"\"pv(dash not allowed at root)pv\"\"\"\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/005_root_dash.nesl
```nesl
<<<<<<<<<nesl
- R"""pv(dash not allowed at root)pv"""
=========nesl
```
______________________________ unit/block-parser/structure-errors/006_orphaned_closing_at_root.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found ] instead",
      "content": "]",
      "context": "<<<<<<<<<nesl\n]\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/006_orphaned_closing_at_root.nesl
```nesl
<<<<<<<<<nesl
]
=========nesl
```
______________________________ unit/block-parser/structure-errors/007_orphaned_paren_at_root.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found ) instead",
      "content": ")",
      "context": "<<<<<<<<<nesl\n)\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/007_orphaned_paren_at_root.nesl
```nesl
<<<<<<<<<nesl
)
=========nesl
```
______________________________ unit/block-parser/structure-errors/008_inline_object_with_content.json
```json
{
  "errors": [
    {
      "line": 3,
      "code": "inline_structure_not_allowed",
      "message": "Structure delimiters must be on their own lines",
      "content": "  data = { key = R\"\"\"pv(value)pv\"\"\" }",
      "context": "<<<<<<<<<nesl\n{\n  data = { key = R\"\"\"pv(value)pv\"\"\" }\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/008_inline_object_with_content.nesl
```nesl
<<<<<<<<<nesl
{
  data = { key = R"""pv(value)pv""" }
}
=========nesl
```
______________________________ unit/block-parser/structure-errors/009_inline_array_with_content.json
```json
{
  "errors": [
    {
      "line": 3,
      "code": "inline_structure_not_allowed",
      "message": "Structure delimiters must be on their own lines",
      "content": "  items = [ - R\"\"\"pv(item)pv\"\"\" ]",
      "context": "<<<<<<<<<nesl\n{\n  items = [ - R\"\"\"pv(item)pv\"\"\" ]\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/009_inline_array_with_content.nesl
```nesl
<<<<<<<<<nesl
{
  items = [ - R"""pv(item)pv""" ]
}
=========nesl
```
______________________________ unit/block-parser/structure-errors/010_opening_delimiter_with_content.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "inline_structure_not_allowed",
      "message": "Structure delimiters must be on their own lines",
      "content": "{ key = R\"\"\"pv(starts on same line)pv\"\"\"",
      "context": "<<<<<<<<<nesl\n{ key = R\"\"\"pv(starts on same line)pv\"\"\"\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/010_opening_delimiter_with_content.nesl
```nesl
<<<<<<<<<nesl
{ key = R"""pv(starts on same line)pv"""
}
=========nesl
```
______________________________ unit/block-parser/structure-errors/011_orphaned_object_closing_at_root.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found } instead",
      "content": "}",
      "context": "<<<<<<<<<nesl\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/011_orphaned_object_closing_at_root.nesl
```nesl
<<<<<<<<<nesl
}
=========nesl
```
______________________________ unit/block-parser/structure-errors/012_assignment_at_root.json
```json
{
  "errors": [
    {
      "line": 2,
      "code": "root_must_be_object",
      "message": "NESL blocks must contain a single root object. Found assignment instead",
      "content": "key = R\"\"\"pv(value)pv\"\"\"",
      "context": "<<<<<<<<<nesl\nkey = R\"\"\"pv(value)pv\"\"\"\n}\n=========nesl"
    }
  ]
}
```
______________________________ unit/block-parser/structure-errors/012_assignment_at_root.nesl
```nesl
<<<<<<<<<nesl
key = R"""pv(value)pv"""
}
=========nesl
```
______________________________ unit/line-classification/test-cases.json
```json
{
  "structural_delimiters_exact_match_only": [
    { "input": "{", "expected": { "type": "object_start" } },
    { "input": "  {  ", "expected": { "type": "object_start" } },
    { "input": "{x", "expected": { "type": "unknown", "line": "{x" } },
    { "input": "{}", "expected": { "type": "unknown", "line": "{}" } },
    { "input": "}", "expected": { "type": "object_end" } },
    { "input": "  }  ", "expected": { "type": "object_end" } },
    { "input": "[", "expected": { "type": "array_start" } },
    { "input": " [ ", "expected": { "type": "array_start" } },
    { "input": "]", "expected": { "type": "array_end" } },
    { "input": "  ]", "expected": { "type": "array_end" } },
    { "input": "(", "expected": { "type": "multiline_start" } },
    { "input": "  (  ", "expected": { "type": "multiline_start" } },
    { "input": ")", "expected": { "type": "multiline_end" } },
    { "input": ")  ", "expected": { "type": "multiline_end" } }
  ],
  "assignment_requires_non_empty_key": [
    { "input": "key = value", "expected": { "type": "assignment", "key": "key", "rest": " value" } },
    { "input": "key=value", "expected": { "type": "assignment", "key": "key", "rest": "value" } },
    { "input": "key = ", "expected": { "type": "assignment", "key": "key", "rest": " " } },
    { "input": "key=", "expected": { "type": "assignment", "key": "key", "rest": "" } },
    { "input": "=value", "expected": { "type": "unknown", "line": "=value" } },
    { "input": " = ", "expected": { "type": "unknown", "line": " = " } },
    { "input": "key with spaces = val", "expected": { "type": "assignment", "key": "key with spaces", "rest": " val" } },
    { "input": "key=with=equals", "expected": { "type": "assignment", "key": "key", "rest": "with=equals" } },
    { "input": "  indented = yes  ", "expected": { "type": "assignment", "key": "indented", "rest": " yes  " } }
  ],
  "array_elements_dash_first_non_whitespace": [
    { "input": "- value", "expected": { "type": "array_element", "rest": " value" } },
    { "input": "-value", "expected": { "type": "array_element", "rest": "value" } },
    { "input": "  - value", "expected": { "type": "array_element", "rest": " value" } },
    { "input": "-", "expected": { "type": "array_element", "rest": "" } },
    { "input": "a- value", "expected": { "type": "unknown", "line": "a- value" } },
    { "input": "--double", "expected": { "type": "array_element", "rest": "-double" } },
    { "input": " -  ", "expected": { "type": "array_element", "rest": "  " } }
  ],
  "blank_lines": [
    { "input": "", "expected": { "type": "blank" } },
    { "input": " ", "expected": { "type": "blank" } },
    { "input": "\t", "expected": { "type": "blank" } },
    { "input": "  \t  ", "expected": { "type": "blank" } }
  ],
  "unknown_everything_else": [
    { "input": "R\"\"\"pv(test)pv\"\"\"", "expected": { "type": "unknown", "line": "R\"\"\"pv(test)pv\"\"\"" } },
    { "input": "random text", "expected": { "type": "unknown", "line": "random text" } },
    { "input": "  string alone  ", "expected": { "type": "unknown", "line": "  string alone  " } }
  ]
}
```
______________________________ unit/string-literals/001_line_extraction.txt
```txt
R"""pv(simple)pv"""
R"""pv()pv"""
R"""pv(contains )pv""" in the middle)pv"""
R"""pv(has )pv""" and also R"""pv( patterns)pv"""
R"""pv()pv""" at the beginning)pv"""
R"""pv(ends with )pv""")pv"""
R"""pv(R"""pv(not actually nested)pv""")pv"""
R"""pv(multiple )pv""" and )pv""" and even )pv""" patterns)pv"""
prefix R"""pv(string with prefix)pv"""
R"""pv(string with suffix)pv""" suffix
  R"""pv(indented string)pv"""
    R"""pv(deeply indented)pv"""
key = R"""pv(assignment context)pv"""
  key = R"""pv(indented assignment)pv"""
- R"""pv(array element)pv"""
  - R"""pv(indented array element)pv"""
R"""pv(first)pv""" R"""pv(second)pv"""
R"""pv(one)pv""" R"""pv(two)pv""" R"""pv(three)pv"""
R"""pv(text)pv""")pv""")pv""")pv"""
R"""pv(unterminated string
R"""pv(good)pv""" extra content
R"""pv(valid)pv"""   
no string markers here
  R"""pv(missing close
```
______________________________ unit/string-literals/001_line_extraction_expected.json
```json
[
  {"value": "simple"},
  {"value": ""},
  {"value": "contains )pv\"\"\" in the middle"},
  {"value": "has )pv\"\"\" and also R\"\"\"pv( patterns"},
  {"value": ")pv\"\"\" at the beginning"},
  {"value": "ends with )pv\"\"\""},
  {"value": "R\"\"\"pv(not actually nested)pv\"\"\""},
  {"value": "multiple )pv\"\"\" and )pv\"\"\" and even )pv\"\"\" patterns"},
  {"error": "invalid_string_start"},
  {"error": "content_after_string"},
  {"value": "indented string"},
  {"value": "deeply indented"},
  {"error": "invalid_string_start"},
  {"error": "invalid_string_start"},
  {"error": "invalid_string_start"},
  {"error": "invalid_string_start"},
  {"value": "first)pv\"\"\" R\"\"\"pv(second"},
  {"value": "one)pv\"\"\" R\"\"\"pv(two)pv\"\"\" R\"\"\"pv(three"},
  {"value": "text)pv\"\"\")pv\"\"\")pv\"\"\""},
  {"error": "string_unterminated"},
  {"error": "content_after_string"},
  {"value": "valid"},
  {"error": "string_not_found"},
  {"error": "string_unterminated"}
]
```
______________________________ unit/string-literals/002_custom_delimiters.txt
```txt
%%%[simple]%%%
%%%[empty]%%%
%%%[contains ]%%% in middle]%%%
prefix %%%[with prefix]%%%
%%%[with suffix]%%% suffix
%%%[first]%%% %%%[second]%%%
%%%[unterminated
%%%[valid]%%% extra
no markers
```
______________________________ unit/string-literals/002_custom_delimiters_expected.json
```json
{
  "config": {
    "stringOpen": "%%%[",
    "stringClose": "]%%%"
  },
  "results": [
    {"value": "simple"},
    {"value": "empty"},
    {"value": "contains ]%%% in middle"},
    {"error": "invalid_string_start"},
    {"error": "content_after_string"},
    {"value": "first]%%% %%%[second"},
    {"error": "string_unterminated"},
    {"error": "content_after_string"},
    {"error": "string_not_found"}
  ]
}
```
