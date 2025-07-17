## TELT Tricky Syntax to JSON Conversion Examples

### Example 1: CREATE_FILE with delimiter patterns in content

**TELT Syntax:**
```telt
#!telt [3-char SHA: x9z]
// Creating a file that contains the delimiter pattern
=== CREATE_FILE ===
--FILE x9z--
docs/parser-notes.txt
--CONTENT x9z--
When parsing, look for --END x9z-- but ignore this one!
The real delimiter is at the bottom.
Even this won't break it: --END x9z--
Because it's inside the content block.
--END x9z--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "docs/parser-notes.txt",
    "CONTENT": "When parsing, look for --END x9z-- but ignore this one!\nThe real delimiter is at the bottom.\nEven this won't break it: --END x9z--\nBecause it's inside the content block."
  }
}
```

### Example 2: BASH with similar-looking patterns

**TELT Syntax:**
```telt
#!telt [3-char SHA: q2w]
// Bash script with similar-looking patterns
=== BASH ===
echo "Processing --END q2w-- tags"
grep "--END" *.txt | sed 's/--END q2w--/FOUND/g'
# This comment has --END q2w-- too
--END q2w--
```

**JSON Equivalent:**
```json
{
  "BASH": "echo \"Processing --END q2w-- tags\"\ngrep \"--END\" *.txt | sed 's/--END q2w--/FOUND/g'\n# This comment has --END q2w-- too"
}
```

### Example 3: REPLACE_IN_FILE with nested delimiter-like content

**TELT Syntax:**
```telt
#!telt [3-char SHA: m7j]
// Replace operation with nested delimiter-like content
=== REPLACE_IN_FILE ===
--FILE m7j--
config/syntax.js
--MODES m7j--
overwrite,
--FIND m7j--
const delimiter = '--END';
const pattern = /--END [a-z0-9]{3}--/g;
--REPLACE m7j--
const delimiter = '--END';
const pattern = /--END [a-z0-9]{3}--/g;
const example = '--END m7j--'; // This is safe!
--END m7j--
```

**JSON Equivalent:**
```json
{
  "REPLACE_IN_FILE": {
    "FILE": "config/syntax.js",
    "MODES": "overwrite,",
    "FIND": "const delimiter = '--END';\nconst pattern = /--END [a-z0-9]{3}--/g;",
    "REPLACE": "const delimiter = '--END';\nconst pattern = /--END [a-z0-9]{3}--/g;\nconst example = '--END m7j--'; // This is safe!"
  }
}
```

### Example 4: CREATE_FILE with multiple fake endings

**TELT Syntax:**
```telt
#!telt [3-char SHA: p5k]
// File with multiple fake endings
=== CREATE_FILE ===
--FILE p5k--
test/edge-cases.md
--CONTENT p5k--
# Edge Cases
- What if we have --END p5k-- with leading whitespace?
 --END p5k--
Still parsing because the real end is here:
--END p5k--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "test/edge-cases.md",
    "CONTENT": "# Edge Cases\n- What if we have --END p5k-- with leading whitespace?\n --END p5k--\nStill parsing because the real end is here:"
  }
}
```

### Example 5: EXEC with confusing output

**TELT Syntax:**
```telt
#!telt [3-char SHA: n8f]
// Exec with confusing output
=== EXEC ===
node -e "console.log('--END n8f-- is not the end'); console.log('Multiple --END n8f-- instances'); process.exit(0);"
--END n8f--
```

**JSON Equivalent:**
```json
{
  "EXEC": "node -e \"console.log('--END n8f-- is not the end'); console.log('Multiple --END n8f-- instances'); process.exit(0);\""
}
```

### Example 6: CREATE_FILE about the syntax itself

**TELT Syntax:**
```telt
#!telt [3-char SHA: v3t]
// Creating a file about the syntax itself
=== CREATE_FILE ===
--FILE v3t--
.telt/syntax-spec.txt
--CONTENT v3t--
TELT Syntax Specification:
- Start: #!telt [3-char SHA: xyz]
- End: --END xyz--
Example: --END v3t-- (but this doesn't end it)
The hash ensures: --END abc-- won't interfere

--FILE v3t--
--MODES v3t--
and this literal END command (bc it doenst match our delimiter hash!)
--END v4t--
but now here's the real valid end syntax marker below:
--END v3t--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": [
      ".telt/syntax-spec.txt",
      "--MODES v3t--"
    ],
    "CONTENT": "TELT Syntax Specification:\n- Start: #!telt [3-char SHA: xyz]\n- End: --END xyz--\nExample: --END v3t-- (but this doesn't end it)\nThe hash ensures: --END abc-- won't interfere\n",
    "MODES": "and this literal END command (bc it doenst match our delimiter hash!)\n--END v4t--\nbut now here's the real valid end syntax marker below:"
  }
}
```

### Example 7: REPLACE_IN_FILE with regex patterns

**TELT Syntax:**
```telt
#!telt [3-char SHA: c6h]
// Replace with regex patterns that look like delimiters
=== REPLACE_IN_FILE ===
--FILE c6h--
lib/parser.js
--MODES c6h--
overwrite,
--FIND c6h--
const regex = /--END.*--/;
--REPLACE c6h--
const regex = /--END.*--/;
const hashPattern = /--END [a-f0-9]{3}--/;
const example = "--END c6h--"; // Safe in strings
const notEnd = `--END c6h--`; // Also safe
--END c6h--
```

**JSON Equivalent:**
```json
{
  "REPLACE_IN_FILE": {
    "FILE": "lib/parser.js",
    "MODES": "overwrite,",
    "FIND": "const regex = /--END.*--/;",
    "REPLACE": "const regex = /--END.*--/;\nconst hashPattern = /--END [a-f0-9]{3}--/;\nconst example = \"--END c6h--\"; // Safe in strings\nconst notEnd = `--END c6h--`; // Also safe"
  }
}
```

### Example 8: BASH:5.0 with nested hash collision attempt

**TELT Syntax:**
```telt
#!telt [3-char SHA: r1y]
// Bash with nested hash collision attempt
=== BASH:5.0 ===
# Generate a hash that might be r1y
echo "Searching for --END r1y-- pattern"
for i in {1..100}; do
  hash=$(echo $i | md5sum | cut -c1-3)
  echo "Generated: --END $hash--"
  if [[ "$hash" == "r1y" ]]; then
    echo "Found matching hash: --END r1y--"
  fi
done
--END r1y--
```

**JSON Equivalent:**
```json
{
  "BASH:5.0": "# Generate a hash that might be r1y\necho \"Searching for --END r1y-- pattern\"\nfor i in {1..100}; do\n  hash=$(echo $i | md5sum | cut -c1-3)\n  echo \"Generated: --END $hash--\"\n  if [[ \"$hash\" == \"r1y\" ]]; then\n    echo \"Found matching hash: --END r1y--\"\n  fi\ndone"
}
```

### Example 9: CREATE_FILE with markdown sections

**TELT Syntax:**
```telt
#!telt [3-char SHA: k4p]
// Creating a markdown file with section separators
=== CREATE_FILE ===
--FILE k4p--
docs/formatting.md
--CONTENT k4p--
# Document Formatting Guide

=== INTRODUCTION ===
This section covers basic formatting.

=== ADVANCED TOPICS ===
Here we discuss complex patterns.

=== CREATE_FILE ===
^ That's not a command, just a heading!

=== BASH ===
^ Also not a command, just text.
--END k4p--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "docs/formatting.md",
    "CONTENT": "# Document Formatting Guide\n\n=== INTRODUCTION ===\nThis section covers basic formatting.\n\n=== ADVANCED TOPICS ===\nHere we discuss complex patterns.\n\n=== CREATE_FILE ===\n^ That's not a command, just a heading!\n\n=== BASH ===\n^ Also not a command, just text."
  }
}
```

### Example 10: CREATE_FILE with config file

**TELT Syntax:**
```telt
#!telt [3-char SHA: j9m]
// Config file with separator-like syntax
=== CREATE_FILE ===
--FILE j9m--
config/rules.conf
--CONTENT j9m--
[RULES]
=== SECURITY ===
firewall = enabled
port = 443

=== DATABASE ===
type = postgres
=== REPLACE_IN_FILE ===
^ This is just a config section name

=== LOGGING ===
level = verbose
--END j9m--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "config/rules.conf",
    "CONTENT": "[RULES]\n=== SECURITY ===\nfirewall = enabled\nport = 443\n\n=== DATABASE ===\ntype = postgres\n=== REPLACE_IN_FILE ===\n^ This is just a config section name\n\n=== LOGGING ===\nlevel = verbose"
  }
}
```

### Example 11: BASH with heredoc containing telt-like syntax

**TELT Syntax:**
```telt
#!telt [3-char SHA: w2x]
// Script that processes telt-like syntax
=== BASH ===
cat << 'EOF'
#!/bin/bash
# Telt processor simulator

if [[ "$1" == "=== CREATE_FILE ===" ]]; then
    echo "Processing create file command"
elif [[ "$1" == "=== BASH ===" ]]; then
    echo "Processing bash command"
elif [[ "$1" == "=== EXEC ===" ]]; then
    echo "Processing exec command"
fi

# None of these === patterns === matter
# Because we're inside a bash block
EOF
--END w2x--
```

**JSON Equivalent:**
```json
{
  "BASH": "cat << 'EOF'\n#!/bin/bash\n# Telt processor simulator\n\nif [[ \"$1\" == \"=== CREATE_FILE ===\" ]]; then\n    echo \"Processing create file command\"\nelif [[ \"$1\" == \"=== BASH ===\" ]]; then\n    echo \"Processing bash command\"\nelif [[ \"$1\" == \"=== EXEC ===\" ]]; then\n    echo \"Processing exec command\"\nfi\n\n# None of these === patterns === matter\n# Because we're inside a bash block\nEOF"
}
```

### Example 12: REPLACE_IN_FILE adding documentation

**TELT Syntax:**
```telt
#!telt [3-char SHA: g7n]
// Replace operation adding telt-like documentation
=== REPLACE_IN_FILE ===
--FILE g7n--
src/parser.js
--MODES g7n--
overwrite,
--FIND g7n--
// Parse command
function parseCommand(input) {
  return input.trim();
}
--REPLACE g7n--
// Parse command
// Supported commands:
// === CREATE_FILE ===
// === BASH ===
// === EXEC ===
// === REPLACE_IN_FILE ===
function parseCommand(input) {
  return input.trim();
}
--END g7n--
```

**JSON Equivalent:**
```json
{
  "REPLACE_IN_FILE": {
    "FILE": "src/parser.js",
    "MODES": "overwrite,",
    "FIND": "// Parse command\nfunction parseCommand(input) {\n  return input.trim();\n}",
    "REPLACE": "// Parse command\n// Supported commands:\n// === CREATE_FILE ===\n// === BASH ===\n// === EXEC ===\n// === REPLACE_IN_FILE ===\nfunction parseCommand(input) {\n  return input.trim();\n}"
  }
}
```

### Example 13: CREATE_FILE with fake telt blocks

**TELT Syntax:**
```telt
#!telt [3-char SHA: t5v]
// Creating a test file with fake telt blocks
=== CREATE_FILE ===
--FILE t5v--
test/mock-telt.txt
--CONTENT t5v--
This is what a telt block looks like:

=== CREATE_FILE ===
--FILE fake--
/path/to/file
--CONTENT fake--
file content
--END fake--

But since we're inside content, all of this:
=== BASH ===
=== EXEC ===
=== REPLACE_IN_FILE ===
...is just literal text!
--END t5v--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "test/mock-telt.txt",
    "CONTENT": "This is what a telt block looks like:\n\n=== CREATE_FILE ===\n--FILE fake--\n/path/to/file\n--CONTENT fake--\nfile content\n--END fake--\n\nBut since we're inside content, all of this:\n=== BASH ===\n=== EXEC ===\n=== REPLACE_IN_FILE ===\n...is just literal text!"
  }
}
```

### Example 14: CREATE_FILE with markdown code blocks

**TELT Syntax:**
```telt
#!telt [3-char SHA: b8q]
// README with code examples
=== CREATE_FILE ===
--FILE b8q--
README.md
--CONTENT b8q--
# Usage Examples

```bash
#!telt [3-char SHA: xyz]
=== BASH ===
echo "This is just example code"
--END xyz--
```

The above won't execute - it's just markdown!
--END b8q--
```

this is just a loose fence to fix highlighting in the IDE where the human is reading this document. not meaningful for syntax:
``` 

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "README.md",
    "CONTENT": "# Usage Examples\n\n```bash\n#!telt [3-char SHA: xyz]\n=== BASH ===\necho \"This is just example code\"\n--END xyz--\n```\n\nThe above won't execute - it's just markdown!"
  }
}
```

### Example 15: CREATE_FILE with Python docstring

**TELT Syntax:**
```telt
#!telt [3-char SHA: f3d]
// Python file with embedded shell commands in docstring
=== CREATE_FILE ===
--FILE f3d--
deploy.py
--CONTENT f3d--
def deploy():
    """Deploy the application.
    
    Usage:
    ```
    === BASH ===
    python deploy.py --prod
    --END abc--
    ```
    """
    print("Deploying...")
--END f3d--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "deploy.py",
    "CONTENT": "def deploy():\n    \"\"\"Deploy the application.\n    \n    Usage:\n    ```\n    === BASH ===\n    python deploy.py --prod\n    --END abc--\n    ```\n    \"\"\"\n    print(\"Deploying...\")"
  }
}
```

### Example 16: CREATE_FILE with indented documentation

**TELT Syntax:**
```telt
#!telt [3-char SHA: y6k]
// Python file with indented documentation
=== CREATE_FILE ===
--FILE y6k--
script.py
--CONTENT y6k--
def process():
    """
    Example usage:
        === CREATE_FILE ===
        --FILE tmp--
        data.txt
        --CONTENT tmp--
        sample data
        --END tmp--
    
    All indented - just documentation!
    """
    pass
--END y6k--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "script.py",
    "CONTENT": "def process():\n    \"\"\"\n    Example usage:\n        === CREATE_FILE ===\n        --FILE tmp--\n        data.txt\n        --CONTENT tmp--\n        sample data\n        --END tmp--\n    \n    All indented - just documentation!\n    \"\"\"\n    pass"
  }
}
```

### Example 17: CREATE_FILE with YAML

**TELT Syntax:**
```telt
#!telt [3-char SHA: m2r]
// YAML with indented text
=== CREATE_FILE ===
--FILE m2r--
config.yml
--CONTENT m2r--
documentation:
  example: |
    To use this tool:
      === BASH ===
      ./run.sh
      --END xyz--
    
    Note: Those markers are just text!
--END m2r--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "config.yml",
    "CONTENT": "documentation:\n  example: |\n    To use this tool:\n      === BASH ===\n      ./run.sh\n      --END xyz--\n    \n    Note: Those markers are just text!"
  }
}
```

### Example 18: CREATE_FILE with Makefile

**TELT Syntax:**
```telt
#!telt [3-char SHA: p9c]
// Makefile with tab-indented content
=== CREATE_FILE ===
--FILE p9c--
Makefile
--CONTENT p9c--
help:
	@echo "Commands:"
	@echo "  === BUILD ==="
	@echo "  make build"
	@echo "  --END abc--"
	@echo "All indented with tabs - just output!"
--END p9c--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "Makefile",
    "CONTENT": "help:\n\t@echo \"Commands:\"\n\t@echo \"  === BUILD ===\"\n\t@echo \"  make build\"\n\t@echo \"  --END abc--\"\n\t@echo \"All indented with tabs - just output!\""
  }
}
```

### Example 19: CREATE_FILE with leading space examples

**TELT Syntax:**
```telt
#!telt [3-char SHA: h7z]
// Script that outputs telt-like syntax
=== CREATE_FILE ===
--FILE h7z--
generator.sh
--CONTENT h7z--
#!/bin/bash

echo "Generating telt command..."
echo ""
echo " === CREATE_FILE ==="
echo " --FILE output--"
echo " result.txt"
echo " --CONTENT output--"
echo " Generated content"
echo " --END output--"
echo ""
echo "Note: The above has spaces, so it's just text!"

# This would be valid (no space):
# === BASH ===
# But this is not (has space):
 === BASH ===
 echo "This won't execute"
 --END h7z--

# The real end marker (no space):
--END h7z--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "generator.sh",
    "CONTENT": "#!/bin/bash\n\necho \"Generating telt command...\"\necho \"\"\necho \" === CREATE_FILE ===\"\necho \" --FILE output--\"\necho \" result.txt\"\necho \" --CONTENT output--\"\necho \" Generated content\"\necho \" --END output--\"\necho \"\"\necho \"Note: The above has spaces, so it's just text!\"\n\n# This would be valid (no space):\n# === BASH ===\n# But this is not (has space):\n === BASH ===\n echo \"This won't execute\"\n --END h7z--\n\n# The real end marker (no space):"
  }
}
```

### Example 20: CREATE_FILE empty content

**TELT Syntax:**
```telt
#!telt [3-char SHA: v4g]
// Empty content blocks
=== CREATE_FILE ===
--FILE v4g--
empty.txt
--CONTENT v4g--
--END v4g--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "empty.txt",
    "CONTENT": ""
  }
}
```

### Example 21: BASH with output

**TELT Syntax:**
```telt
#!telt [3-char SHA: d5w]
// Nested telt comment syntax
=== BASH ===
cat << 'OUTER'
#!telt [3-char SHA: inner]
// This looks like telt but it's just bash output
=== CREATE_FILE ===
--FILE inner--
OUTER
--END d5w--
```

**JSON Equivalent:**
```json
{
  "BASH": "cat << 'OUTER'\n#!telt [3-char SHA: inner]\n// This looks like telt but it's just bash output\n=== CREATE_FILE ===\n--FILE inner--\nOUTER"
}
```

### Example 22: CREATE_FILE with unicode

**TELT Syntax:**
```telt
#!telt [3-char SHA: z9t]
// Unicode and special characters
=== CREATE_FILE ===
--FILE z9t--
unicode.txt
--CONTENT z9t--
What about unicode?
​=== BASH ===  (starts with zero-width space!)
　=== EXEC === (starts with full-width space!)
	=== CREATE_FILE === (starts with tab!)
All invalid! But this works:
--END z9t--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "unicode.txt",
    "CONTENT": "What about unicode?\n​=== BASH ===  (starts with zero-width space!)\n　=== EXEC === (starts with full-width space!)\n\t=== CREATE_FILE === (starts with tab!)\nAll invalid! But this works:"
  }
}
```

whitespace examples:

Here are three short examples with whitespace edge cases:

### Example 23: Single blank line as value

**TELT Syntax:**
```telt
#!telt [3-char SHA: a4k]
// File with blank line content
=== CREATE_FILE ===
--FILE a4k--
empty-line.txt
--CONTENT a4k--

--END a4k--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": "empty-line.txt",
    "CONTENT": "\n"
  }
}
```

### Example 24: Multiple spaces and tabs only

**TELT Syntax:**
```telt
#!telt [3-char SHA: b7m]
// Replace with only whitespace
=== REPLACE_IN_FILE ===
--FILE b7m--
config.yml
--FIND b7m--
debug: true
--REPLACE b7m--
    		  
--END b7m--
```

**JSON Equivalent:**
```json
{
  "REPLACE_IN_FILE": {
    "FILE": "config.yml",
    "FIND": "debug: true",
    "REPLACE": "    \t\t  "
  }
}
```

### Example 25: Multiple blank lines and mixed whitespace

**TELT Syntax:**
```telt
#!telt [3-char SHA: c9p]
// Script with whitespace-only sections
=== CREATE_FILE ===
--FILE c9p--
whitespace.sh
--CONTENT c9p--
#!/bin/bash
--MODES c9p--


	
  
--FILE c9p--
whitespace2.sh
--END c9p--
```

**JSON Equivalent:**
```json
{
  "CREATE_FILE": {
    "FILE": [
      "whitespace.sh",
      "whitespace2.sh"
    ],
    "CONTENT": "#!/bin/bash",
    "MODES": "\n\n\t\n  "
  }
}
```

### Example 26: multiple operation sections per telt block --> array of operations

**TELT Syntax:**
```telt
#!telt [3-char SHA: r3d]
=== CREATE_FILE ===
--FILE r3d--
README.md
--CONTENT r3d--
# Project Setup
--END r3d--

=== ADD_CONTENT ===
--FILE r3d--
README.md
--CONTENT r3d--
## Getting Started

This is a new project.
--END r3d--

=== FINALIZE ===
--COMMAND r3d--
chmod +x setup.sh
git init
--END r3d--
```

**JSON Equivalent:**
```json
[
  {
    "CREATE_FILE": {
      "FILE": "README.md",
      "CONTENT": "# Project Setup"
    }
  },
  {
    "ADD_CONTENT": {
      "FILE": "README.md",
      "CONTENT": "## Getting Started\n\nThis is a new project."
    }
  },
  {
    "FINALIZE": {
      "COMMAND": "chmod +x setup.sh\ngit init"
    }
  }
]
```