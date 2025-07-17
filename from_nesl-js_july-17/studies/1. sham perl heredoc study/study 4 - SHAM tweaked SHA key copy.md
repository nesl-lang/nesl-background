check out this example format for SHAM syntax that supports literal non-interpolated custom delimiter heredoc:


```sham
#!SHAM [@three_char_SHA: k7m]
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

using a unique 3-char SHA, please convert this data from perl to SHAM syntax:

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


##############################################################################
##############################################################################
##############################################################################

works in gemma 4b!!!

```
#!SHAM [@three_char_SHA: x9z]
{
name = 'hildebrand'
age = 7
p1 = <<<EOT-x9z
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
EOT-x9z
}

{
p2 = <<<EOT-x9z
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
EOT-x9z
}
#!END-SHAM-x9z
```


##############################################################################
##############################################################################
##############################################################################

prompt2:


```perl
my @operations = (
    {
        action => "create_turtle_info",
        type => "breathing",
        content => <<'EOT',
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
EOT
        priority => "high",
    },
    {
        action => "append_turtle_info", 
        type => "respiration",
        content => <<'EOT',
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
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

using a unique 3 char SHA, convert the perl syntax above to SHAM.  



##############################################################################
##############################################################################
##############################################################################

RESPONSE:

works in gemma 4b!!! and claude 4 and gpt4o and everythign else