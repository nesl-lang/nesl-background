# CHON Usage Guide - Custom Heredoc+Json - CHON

No Escaping Ever

Write JSON normally. Use custom heredocs for strings with newlines, tabs, quotes, or backslashes.  

Heredoc symbol format:  

-~~-[3 random alphanumeric chars, all lowercase]

eg:  

-~~-a7f

## Syntax

```chon
{
  "simple": "regular string",
  "multiline": <<<-~~-9he
Line 1
Line 2 with "quotes" and \backslashes
	Tabbed line
  -~~-9he,
  "array": [
    "normal",
    <<<-~~-sf2
Multi
Line
    -~~-sf2,
    42
  ],
  "nested": {
    "code": <<<-~~-87b
if (x > 0) {
    return "value";
    

}
    -~~-87b
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
    "code": "if (x > 0) {\n    return \"value\";\n    \n\n}"
  }
}
```

## Rules
- Start: delimiter followed by newline
- End: end delimiter alone on a line, can be followed by comma or closing structures (}, ] etc)
    note: if delimiter is not otherwise alone on the line, its just treated as raw literal text
- Content between is raw text
- No escaping needed
- pick the 3 random characters to avoid any possible collisions with quoted text, in case we need variable content value containing CHON syntax
- empty newlines are preserved in heredoc bloc


## Most important rule:

never escape anything.  show its literal form in a heredoc instead of escaping and wrapping in quotes 