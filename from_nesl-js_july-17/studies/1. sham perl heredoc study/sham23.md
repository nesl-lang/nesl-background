
note: sham23 sucks.  see /Users/stuart/repos/nesl-lang/nesl-js/studies/1. sham perl heredoc study/study 23 - sham23.md

Here's the updated SHAM syntax guide with the new approach:

https://claude.ai/chat/a8a7ea27-3479-4a88-b697-165c4aca1057
https://claude.ai/chat/dbdf5d4b-1568-4b36-93f8-05fb261a6786

## SHAM Syntax Format (Single Action Per Block)

### Syntax Rules:
- `key = value` for inline strings (no quotes needed, takes rest of line)
- `key << DELIMITER` for heredoc strings (multiline content)
- Empty string is just `key = ` with nothing after

### File Creation Example:

```
#!SHAM [@three-char-SHA-256: k7m]
// creating the file needed for such and such
action = create_file
path = /tmp/hello.txt
content << EOT_SHAM_k7m
 Hello world!
 how are you?
EOT_SHAM_k7m
#!END_SHAM_k7m

#!SHAM [@three-char-SHA-256: h7d]
// create the hello2 file for other reasons
action = create_file
path = /tmp/hello2.txt
content << EOT_SHAM_h7d
 Hello other world!
 how are you?
EOT_SHAM_h7d
#!END_SHAM_h7d
```

### Search/Replace Example:

```
#!SHAM [@three-char-SHA-256: vc8]
// replace some text for blah blah blah reasons
action = replace_in_file
path = /tmp/hello.txt
search << EOT_SHAM_vc8
 Hello world!
 how are you?
EOT_SHAM_vc8
replace << EOT_SHAM_vc8

   
 asdf "awef" 'lkj'
lalalala 

EOT_SHAM_vc8
#!END_SHAM_vc8
```

### More Examples:

```
#!SHAM [@three-char-SHA-256: a9x]
// example with empty value and literal heredoc string
action = check_file
path = /etc/config.conf
empty_field = 
literal_test = <<'EOT_SHAM_test'
#!END_SHAM_a9x

#!SHAM [@three-char-SHA-256: m3p]
// rename a file
action = rename_file
old_path = /tmp/old name with spaces.txt
new_path = /tmp/new_name.txt
#!END_SHAM_m3p
```

Note: Each heredoc delimiter is `EOT_SHAM_` followed by the three-char-SHA-256 value. The SHA-256 value is also appended to `#!END_SHAM_`.

### Equivalent Perl Syntax:

```perl
#!/usr/bin/perl
use strict;
use warnings;

# First SHAM block - create_file action
my $sham_block_k7m = {
    # creating the file needed for such and such
    action => "create_file",
    path => "/tmp/hello.txt",
    content => <<'EOT_SHAM_k7m'
 Hello world!
 how are you?
EOT_SHAM_k7m
};

# Second SHAM block - create_file action
my $sham_block_h7d = {
    # create the hello2 file for other reasons
    action => "create_file",
    path => "/tmp/hello2.txt",
    content => <<'EOT_SHAM_h7d'
 Hello other world!
 how are you?
EOT_SHAM_h7d
};

# Third SHAM block - replace_in_file action
my $sham_block_vc8 = {
    # replace some text for blah blah blah reasons
    action => "replace_in_file",
    path => "/tmp/hello.txt",
    search => <<'EOT_SHAM_vc8'
 Hello world!
 how are you?
EOT_SHAM_vc8
    replace => <<'EOT_SHAM_vc8'

   
 asdf "awef" 'lkj'
lalalala 

EOT_SHAM_vc8
};
```

The key improvements:
1. No quotes needed for inline strings
2. Clear distinction between `=` (inline) and `<<` (heredoc)
3. Handles empty strings naturally
4. Preserves spaces in paths without escaping
5. Simpler for LLMs to generate correctly