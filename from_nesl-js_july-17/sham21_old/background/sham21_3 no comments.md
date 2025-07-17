
https://claude.ai/chat/b4f356de-73e2-48c1-bdf8-b9ab4d3189a2

## SHAM Syntax Format (Single Action Per Block)

i think there should be an error if user tries to encode escaped newline in inline string

### File Creation Example:


> creating the file needed for such and such
```
#!SHAM [@three-char-SHA-256: k7m]
action = "create_file"
path = "/tmp/\"hello\".txt"
content = <<'EOT_SHAM_k7m'
 Hello world!
 how are you?
EOT_SHAM_k7m
#!END_SHAM_k7m
```

> createe the hello2 file for other reasons
```
#!SHAM [@three-char-SHA-256: h7d]
action = "create_file"
path = "/tmp/hello2.txt"
content = <<'EOT_SHAM_h7d'
 Hello other world!
 how are you?
EOT_SHAM_h7d
#!END_SHAM_h7d
```

### Search/Replace Example:
>replace some text for blah blah blha reasons
```
#!SHAM [@three-char-SHA-256: vc8]
action = "replace_in_file"
search = <<'EOT_SHAM_vc8'
 Hello world!
 how are you?
EOT_SHAM_vc8
replace = <<'EOT_SHAM_vc8'

   
 asdf "awef" 'lkj'
lalalala 

EOT_SHAM_vc8
#!END_SHAM_vc8
```

note: each heredoc delimiter is `EOT_SHAM_` followed by the `three-char-SHA-256` value. also appended to the END_SHAM_


### Equivalent Perl Syntax:

```perl
#!/usr/bin/perl
use strict;
use warnings;

# First SHAM block - create_file action
my $sham_block_k7m = {
    # creating the file needed for such and such
    action => "create_file",
    path => "/tmp/\"hello\".txt",
    content => <<'EOT_SHAM_k7m'
 Hello world!
 how are you?
EOT_SHAM_k7m
};

# Second SHAM block - create_file action
my $sham_block_h7d = {
    # createe the hello2 file for other reasons
    action => "create_file",
    path => "/tmp/hello2.txt",
    content => <<'EOT_SHAM_h7d'
 Hello other world!
 how are you?
EOT_SHAM_h7d
};

# Third SHAM block - replace_in_file action
my $sham_block_vc8 = {
    # replace some text for blah blah blha reasons
    action => "replace_in_file",
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
