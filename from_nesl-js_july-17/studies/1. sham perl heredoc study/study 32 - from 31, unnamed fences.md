Here's the updated SHAM syntax guide where each action is in its own SHAM code block:

## SHAM Syntax Format (Single Action Per Block)

### File Creation Example:

```
#!SHAM [@three-char-SHA-256: k7m]
action = "create_file"
path = "/tmp/hello.txt"
content = <<'EOT_k7m'
 Hello world!
 how are you?
EOT_k7m
#!END_k7m

#!SHAM [@three-char-SHA-256: h7d]
action = "create_file"
path = "/tmp/hello2.txt"
content = <<'EOT_h7d'
 Hello other world!
 how are you?
EOT_h7d
#!END_h7d
```

### Search/Replace Example:

```
#!SHAM [@three-char-SHA-256: vc8]
action = "replace_in_file"
search = <<'EOT_vc8'
 Hello world!
 how are you?
EOT_vc8
replace = <<'EOT_vc8'

   
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
    action => "create_file",
    path => "/tmp/hello.txt",
    content => <<'EOT_k7m'
 Hello world!
 how are you?
EOT_k7m
};

# Second SHAM block - create_file action
my $sham_block_h7d = {
    # createe the hello2 file for other reasons
    action => "create_file",
    path => "/tmp/hello2.txt",
    content => <<'EOT_h7d'
 Hello other world!
 how are you?
EOT_h7d
};

# Third SHAM block - replace_in_file action
my $sham_block_vc8 = {
    # replace some text for blah blah blha reasons
    action => "replace_in_file",
    search => <<'EOT_vc8'
 Hello world!
 how are you?
EOT_vc8
    replace => <<'EOT_vc8'

   
 asdf "awef" 'lkj'
lalalala 

EOT_vc8
};
```

---
 
please format these literal multiline text string as SHAM search/replace syntax:

search text block:

```

  
 Roses are red

 Violets are blue  
  
```

replace text block:


```
Roses are red
Violets are blue  
```


##############################################################################
##############################################################################
##############################################################################

not any better.  excellent

❌
✅

c4.1m  : ❌❌❌❌
c4.1   : 
co4mh  : 
co4m   : 
c4o    : 
4b     : 
12b    : 
27b    : 
2.0fl  : 
2.0f   : 
2.5fl  : 
2.5f   : 
2.5p   : 
clh3.5 : 