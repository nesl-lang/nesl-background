check out this example format for SHAM syntax that supports literal non-interpolated custom delimiter heredoc:


```sham
#!SHAM 
{
action = "create_file"
path = "/tmp/hello.txt"
content = <<'EOT_SHAM'
 Hello world!
 how are you?
EOT_SHAM
}

{
dothing = "true"
count = 3
str = <<'EOT_SHAM'

   
 asdf "awef" 'lkj'
lalalala 

EOT_SHAM
}
#!END-SHAM
```

note: each heredoc delimiter is `EOT_SHAM`. 

example in equivalent perl:


```perl
my @operations = (
   {
       action => "create_file",
       path => "/tmp/hello.txt",
       content => <<'TEXT',
 Hello world!
 how are you?
TEXT
   },
   {
       dothing => "true",
       count => 3,
       str => <<'STRING',

   
 asdf "awef" 'lkj'
lalalala 

STRING
   }
);
```


---
 
please format this literal multiline text string as SHAM syntax:

```

  
 Roses are red

 Violets are blue  
  
```


##############################################################################
##############################################################################
##############################################################################


so maybe these results mean that we just SHOULD NOT expect the LLM to come up with its own unique SHA.  we should feed that in per prompt.  

❌
✅

c4.1m  : ✅
c4.1   : ✅
co4mh  : ❌
c4.1   : ✅
co4m   : ✅
c4o    : ✅
4b     : ❌
12b    : ✅
27b    : ✅
2.0fl  : ✅
2.0f   : ✅
2.5fl  : ✅
2.5f   : ✅
2.5p   : ✅
