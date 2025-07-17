Here's the updated SHAM syntax guide where each action is in its own SHAM code block:

## SHAM Syntax Format (Single Action Per Block)

### File Creation Example:

```sh sham
#!CREATE_FILE [@three-char-SHA-256: k7m]
path = "/tmp/hello.txt"
content = <<'EOT_k7m'
 Hello world!
 how are you?
EOT_k7m
#!END_k7m

#!CREATE_FILE [@three-char-SHA-256: h7d]
path = "/tmp/hello2.txt"
content = <<'EOT_h7d'
 Hello other world!
 how are you?
EOT_h7d
#!END_h7d
```

### Search/Replace Example:

```sh sham
#!FILE_EDIT [@three-char-SHA-256: vc8]
old_string = <<'EOT_vc8'
 Hello world!
 how are you?
EOT_vc8
new_string = <<'EOT_vc8'

   
 asdf "awef" 'lkj'
lalalala 

EOT_vc8
#!END_vc8
```

note: each heredoc delimiter is `EOT_` followed by the `three-char-SHA-256` value. also appended to the END


### Equivalent Perl Syntax:

```perl
#!/usr/bin/perl
use strict;
use warnings;

# First SHAM block - create_file action
my $sham_block_k7m = {
    # creating the file needed for such and such
    action => "CREATE_FILE",
    path => "/tmp/hello.txt",
    content => <<'EOT_k7m'
 Hello world!
 how are you?
EOT_k7m
};

# Second SHAM block - create_file action
my $sham_block_h7d = {
    # createe the hello2 file for other reasons
    action => "CREATE_FILE",
    path => "/tmp/hello2.txt",
    content => <<'EOT_h7d'
 Hello other world!
 how are you?
EOT_h7d
};

# Third SHAM block - replace_in_file action
my $sham_block_vc8 = {
    # replace some text for blah blah blha reasons
    action => "FILE_EDIT",
    old_string => <<'EOT_vc8'
 Hello world!
 how are you?
EOT_vc8
    new_string => <<'EOT_vc8'

   
 asdf "awef" 'lkj'
lalalala 

EOT_vc8
};
```

---
 
please format these literal multiline text string as SHAM file edit old_string / new_string syntax:

old_string text block:

```

  
 Roses are red

 Violets are blue  
  
```

new_string text block:


```
Roses are red
Violets are blue  
```


##############################################################################
##############################################################################
##############################################################################

damn.  

this DIRECTIVE format was opus4's idea.

update - actually the success is prob due to just removing commnets.  and claude things the directive action version is worse 
https://claude.ai/chat/1c968867-eb1c-4fc1-a727-abab10cdcb1a thank god. so we stick with our current parser exactly.

❌
✅

c4.1m  : ✅❌✅❌❌
c4.1   : ✅
co4mh  : ✅
co4m   : ✅
c4o    : ✅
4b     : ❌     extra whitespace in new_string
12b    : ✅
27b    : ✅
2.0fl  : ✅✅✅✅✅✅✅
2.0f   : ✅
2.5fl  : ✅✅❌✅✅✅✅✅
2.5f   : ✅
2.5p   : ✅
clh3.5 : ✅