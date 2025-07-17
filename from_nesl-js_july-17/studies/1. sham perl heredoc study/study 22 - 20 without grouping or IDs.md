Here's the updated SHAM syntax guide where each action is in its own SHAM code block:

## SHAM Syntax Format (Single Action Per Block)

### File Creation Example:

```
#!SHAM
// creating the file needed for such and such
action = "create_file"
path = "/tmp/hello.txt"
content = <<'EOT_SHAM'
 Hello world!
 how are you?
EOT_SHAM
#!END_SHAM

#!SHAM
// createe the hello2 file for other reasons
action = "create_file"
path = "/tmp/hello2.txt"
content = <<'EOT_SHAM'
 Hello other world!
 how are you?
EOT_SHAM
#!END_SHAM
```

### Search/Replace Example:

```
#!SHAM
//replace some text for blah blah blha reasons
action = "replace_in_file"
search = <<'EOT_SHAM'
 Hello world!
 how are you?
EOT_SHAM
replace = <<'EOT_SHAM'

   
 asdf "awef" 'lkj'
lalalala 

EOT_SHAM
#!END_SHAM
```

note: each heredoc delimiter is `EOT_SHAM`.  each SHAM block terminated with `#!END_SHAM` line


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

so it look slike removing the IDs doesnt rly help any.  2.5fl still hit or miss.  


❌
✅

c4.1m  : ❌
c4.1   : ✅
co4mh  : 
co4m   : 
c4o    : ✅
4b     : 
12b    : 
27b    : ✅
2.0fl  : ✅
2.0f   : ✅
2.5fl  : ❌❌❌❌✅✅✅✅❌
2.5f   : ✅
2.5p   : ✅ 
clh3.5 : ✅