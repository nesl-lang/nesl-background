# HDON Usage Guide

Write JSON normally. Use heredocs for strings with newlines, tabs, quotes, or backslashes.

## Syntax

```json
{
  "simple": "regular string",
  "multiline": <<<END
Line 1
Line 2 with "quotes" and \backslashes
	Tabbed line
END,
  "array": [
    "normal",
    <<<ITEM
Multi
Line
ITEM,
    42
  ],
  "nested": {
    "code": <<<CODE
if (x > 0) {
    return "value";
}
CODE
  }
}
```

## Equivalent in Pure JSON

```json
{
  "simple": "regular string",
  "multiline": "Line 1\nLine 2 with \"quotes\" and \\backslashes\n\tTabbed line",
  "array": [
    "normal",
    "Multi\nLine",
    42
  ],
  "nested": {
    "code": "if (x > 0) {\n    return \"value\";\n}"
  }
}
```

## Rules
- Start: `<<<DELIMITER` followed by newline
- End: `DELIMITER` alone on a line
- Content between is raw text
- No escaping needed