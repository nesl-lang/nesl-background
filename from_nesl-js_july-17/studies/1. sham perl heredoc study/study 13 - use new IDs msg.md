check out this example format for SHAM syntax that supports literal non-interpolated custom delimiter heredoc:


```sham
#!SHAM [@three-char-SHA-256: k7m]
{
action = "create_file"
path = "/tmp/hello.txt"
content = <<'TEXT-k7m'
 Hello world!
 how are you?
TEXT-k7m
}

{
dothing = "true"
count = 3
str = <<'STRING-k7m'
   
 asdf "awef" 'lkj'
lalalala 

STRING-k7m
}
#!END-SHAM-k7m
```

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

please convert these syntaxes from from perl to SHAM syntax:

```perl
my %data = (
    name => 'hildebrand',
    age  => 7,
    p1   => <<'EOT',
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
EOT
    p2   => <<'EOT',
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
EOT
);
```


```perl
my @operations = (
    {
        action => "create_turtle_info",
        type => "breathing",
        content => <<'EOT',
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
EOT
        priority => "high",
    },
    {
        action => "append_turtle_info", 
        type => "respiration",
        content => <<'EOT',
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv(summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
EOT
        validate => 1,
    },
    {
        action => "create_metadata",
        author => "hildebrand",
        age => 7,
        description => <<'DESC',
Research notes on turtle respiratory systems
     compiled from various sources
DESC
        tags => ["biology", "reptiles", "aquatic"],
    }
);
```

and format this literal multiline text string as SHAM:

```

  
 Roses are red

 Violets are blue  
  
```


no explanations please. just the complete syntax. use new unique @three-char-SHA-256 ids

dont use an artifact

##############################################################################
##############################################################################
##############################################################################


so maybe these results mean that we just SHOULD NOT expect the LLM to come up with its own unique SHA.  we should feed that in per prompt.  

❌
✅

c4.1m  : ❌ poem missing newline
c4.1   : ❌ poem missing newline
4b     : ❌
12b    : ❌
27b    : ✅
2.0fl  : ✅
2.0f   : ✅
2.5fl  : ❌ bad poem whitespace
2.5f   : ✅
2.5p   : ✅
