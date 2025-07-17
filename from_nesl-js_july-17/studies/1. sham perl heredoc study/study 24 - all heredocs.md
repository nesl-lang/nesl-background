# SHAM Syntax Format (Heredoc-Only Version)

https://claude.ai/chat/104ce844-aeaa-48d5-a593-62c2fbd44050

## File Creation Example:

```
#!SHAM [@three-char-SHA-256: k7m]
//creating the file needed for such and such
action = <<'EOT_SHAM_k7m'
create_file
EOT_SHAM_k7m
path = <<'EOT_SHAM_k7m'
/tmp/hello.txt
EOT_SHAM_k7m
content = <<'EOT_SHAM_k7m'
Hello world!
how are you?
EOT_SHAM_k7m
#!END_SHAM_k7m

#!SHAM [@three-char-SHA-256: h7d]
//create the hello2 file for other reasons
action = <<'EOT_SHAM_h7d'
create_file
EOT_SHAM_h7d
path = <<'EOT_SHAM_h7d'
/tmp/hello2.txt
EOT_SHAM_h7d
content = <<'EOT_SHAM_h7d'
Hello other world!
how are you?
EOT_SHAM_h7d
#!END_SHAM_h7d
```

## Search/Replace Example:

```
#!SHAM [@three-char-SHA-256: vc8]
//replace some text for blah blah blah reasons
action = <<'EOT_SHAM_vc8'
replace_in_file
EOT_SHAM_vc8
path = <<'EOT_SHAM_vc8'
/tmp/hello.txt
EOT_SHAM_vc8
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

## Equivalent Perl Syntax:

```perl
#!/usr/bin/perl
use strict;
use warnings;

# First SHAM block - create_file action
my $sham_block_k7m = {
    action => <<'EOT_SHAM_k7m',
create_file
EOT_SHAM_k7m
    path => <<'EOT_SHAM_k7m',
/tmp/hello.txt
EOT_SHAM_k7m
    content => <<'EOT_SHAM_k7m'
Hello world!
how are you?
EOT_SHAM_k7m
};

# Second SHAM block - create_file action
my $sham_block_h7d = {
    action => <<'EOT_SHAM_h7d',
create_file
EOT_SHAM_h7d
    path => <<'EOT_SHAM_h7d',
/tmp/hello2.txt
EOT_SHAM_h7d
    content => <<'EOT_SHAM_h7d'
Hello other world!
how are you?
EOT_SHAM_h7d
};

# Third SHAM block - replace_in_file action
my $sham_block_vc8 = {
    action => <<'EOT_SHAM_vc8',
replace_in_file
EOT_SHAM_vc8
    path => <<'EOT_SHAM_vc8',
/tmp/hello.txt
EOT_SHAM_vc8
    search => <<'EOT_SHAM_vc8',
Hello world!
how are you?
EOT_SHAM_vc8
    replace => <<'EOT_SHAM_vc8'


asdf "awef" 'lkj'
lalalala 

EOT_SHAM_vc8
};
```



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


❌
✅

c4.1m  : 
c4.1   : 
co4mh  : 
co4m   : 
c4o    : 
4b     : 
12b    : 
27b    : 
2.0fl  : ✅✅❌✅✅✅✅
2.0f   : 
2.5fl  : ❌❌❌❌❌     still failed fully after simplifying example 
2.5f   : 
2.5p   : 
clh3.5 : 