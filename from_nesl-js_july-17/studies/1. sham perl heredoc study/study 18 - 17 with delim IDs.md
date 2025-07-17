

check out this example format for SHAM syntax that supports literal non-interpolated custom delimiter heredoc:


```sham
#!SHAM [@three-char-SHA-256: k7m]
{
action = "create_file"
path = "/tmp/hello.txt"
content = <<'EOT_SHAM_k7m'
 Hello world!
 how are you?
EOT_SHAM_k7m
}

{
dothing = "true"
count = 3
str = <<'EOT_SHAM_k7m'

   
 asdf "awef" 'lkj'
lalalala 

EOT_SHAM_k7m
}
#!END_SHAM_k7m
```

note: each heredoc delimiter is `EOT_SHAM_` followed by the `three-char-SHA-256` value. also appended to the END_SHAM



SHAM search/replace block format:


#!SHAM [@three-char-SHA-256: vc8]
{
search = <<'EOT_SHAM_vc8'
 Hello world!
 how are you?
EOT_SHAM_vc8
replace = <<'EOT_SHAM_vc8'

   
 asdf "awef" 'lkj'
lalalala 

EOT_SHAM_vc8
}
#!END_SHAM_vc8


example in equivalent perl:


```perl
my @operations = (
   {
       SEARCH => <<'TEXT',
 Hello world!
 how are you?
TEXT
       REPLACE => <<'STRING',

   
 asdf "awef" 'lkj'
lalalala 

STRING
   }
);
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




❌
✅

c4.1m  : ✅                   ✅                ❌
c4.1   : ✅                   ✅                ❌
co4mh  : ✅                   ✅                ❌
c4.1   : ✅                   ✅                ❌
co4m   : ✅                   ✅                ❌
c4o    : ✅                   ✅                ❌
4b     : ❌                   ❌                ❌
12b    : ❌                   ❌                ❌
27b    : ✅                   ✅                ❌
2.0fl  : ✅                   ✅                ❌
2.0f   : ✅                   ✅                ✅
2.5fl  : ✅                   ✅                ❌
2.5f   : ✅                   ✅                ✅
2.5p   : ✅                   ✅                ✅
