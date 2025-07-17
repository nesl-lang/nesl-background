## SHAM Syntax Format (Single Action Per Block)

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

ok so sham23 sucks.  stick with quotes. rip.  

❌
✅

c4.1m  : ❌
c4.1   : ✅
co4mh  : ✅
co4m   : ✅
c4o    : ✅
4b     : 
12b    : 
27b    : ✅
2.0fl  : ❌✅✅✅✅✅❌✅✅✅
2.0f   : ✅✅✅✅
2.5fl  : ❌❌❌❌❌❌❌❌
2.5f   : ✅
2.5p   : ✅
clh3.5 : ✅