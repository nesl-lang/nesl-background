check out this example format for SHAM syntax that supports literal non-interpolated custom delimiter heredoc:


```sham
#!SHAM [@three-char-SHA-256: k7m]
{
action = "create_file"
path = "/tmp/hello.txt"
content = <<<TEXT-k7m
 Hello world!
 how are you?
TEXT-k7m
}

{
dothing = "true"
count = 3
str = <<<STRING-k7m
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

no explanations please. just the syntax. dont use an artifact

##############################################################################
##############################################################################
##############################################################################

ok after simplifying the instructions, similar results.  but actually 4b is perfect, 12b just lumps everythign together in the same SHAM block and also uses the same SHA as in the example, and 27b uses correct nesting but non random SHA (abc, def).

g2.0f is perfect and even faster than the gemmas i think
g2fl - also perfect and fast 

##############################################################################

prompt:

##############################################################################
format this literal multiline text string as SHAM:

```

  
 Roses are red

 Violets are blue  
  ```

##############################################################################
##############################################################################

actually nothing is getting this right.  even including g2.0f...

trying g2.5p ... next gonna ask to just format as perl structured hash object literal noninterpolated heredoc w custom delimiter... could be that even tho custom syntax is better for stupid LLMs, there's nuance involved with exisitng stuff like perl that smarter LLMs will succeed at despite the syntax being harder overall.... or maybe our docs just need whitespace clarification.... maybe our delimiter should be in single quotes... 

oh shit wait actually there was whitespace bewteen the closing fence... lol... ok models rightim wrong....  realized after g2.5pro gave same asnwers....


##############################################################################

prompt:

##############################################################################
format this literal multiline text string as SHAM:

```

  
 Roses are red

 Violets are blue  
  
```

##############################################################################
##############################################################################

❌ 4b 
❌ 12b
✅ 27b
❌ 2.0fl
❌ 2.0f
✅ 2.5p


