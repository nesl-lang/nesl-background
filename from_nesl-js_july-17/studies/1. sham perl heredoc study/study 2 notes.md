PROMPTS:

##############################################################################

check out this example format for SHAM syntax that supports literal non-interpolated custom delimiter heredoc:

example sham:
```SHAM
note1=<<<DELIM_cx4
 This is a raw block of text.
It includes "quotes", \slashes\, $variables, and
  preserves all whitespace 
DELIM_cx4
note2=<<<END_42a
 with    spaces    and	tabs\t\t.
 "Multiple quotes" and 'single ones' too.
END_42a
var1="here is content"
var2=8
```
example in equivalent perl:

my %data = (
    note1 => <<'DELIM_cx4',
 This is a raw block of text.
It includes "quotes", \slashes\, $variables, and
  preserves all whitespace 
DELIM_cx4
    note2 => <<'END_42a',
 with    spaces    and	tabs\t\t.
 "Multiple quotes" and 'single ones' too.
END_42a
    var1 => "here is content",
    var2 => 8
);

---

convert this data from perl to SHAM syntax:

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

convert the above object to SHAM


##############################################################################
##############################################################################
##############################################################################

works in gemma 4b!!!

and note:  this is the format that opus4 thought would be most intuitive for LLMs!!!


##############################################################################

name='hildebrand'
age=7
p1=<<<EOT
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
EOT
p2=<<<EOT
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
EOT

##############################################################################
##############################################################################

fails in gemma 1b:

##############################################################################

name => 'hildebrand',
age => 7,
p1 => <<'EOT'
Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
EOT
    p2 => <<'EOT'
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
EOT



##############################################################################
##############################################################################
##############################################################################


so i am surprised that this custom format seems to work better than existing syntax!!!!!