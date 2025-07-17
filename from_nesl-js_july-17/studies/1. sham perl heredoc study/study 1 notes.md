PROMPTS:

##############################################################################


```
name: hildebrand
age: 7
p1: """
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
"""
p2: """
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
"""
```

convert this data to perl hash data structure. use heredoc (`<<` style) with custom delimter for any multiline values

##############################################################################

```
name: hildebrand
age: 7
p1: """
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
"""
p2: """
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
"""
```

convert this data to perl as immediate scalar assignments. use heredoc with custom delimter for multiline values

##############################################################################
##############################################################################
##############################################################################

first bad results: gemini gemma 4b:

##############################################################################


use strict;
use warnings;

my %hildebrand = <<'END_HASH';

name: hildebrand
age: 7
p1: "Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
"
p2: ", which contains large sacs that are lined with many finger-like 
projections that take up 
    dissolved 
     oxygen from the water.[52]"

END_HASH

print Dumper \%hildebrand;

##############################################################################

$name = 'hildebrand';
$age = 7;
$p1 = 'Although many turtles spend large amounts of their lives underwater,\nall turtles breathe air and must surface at regular intervals to refill their lungs.\n  Depending on the species, immersion periods vary between a minute and an hour.[51]\nSome species can respire through the cloaca\n';
$p2 = ', which contains large sacs that are lined with many finger-like\n    dissolved\n     oxygen\n     from the water.[52]';

##############################################################################
##############################################################################
##############################################################################


results so far:

every model perfect down to and including gemini 12b.  but at gemini 4b it screws up for both perl immediate assignmgnet and for perl structured hash object.  loses leading whitespace.  and doens't do heredocs even.  

everything else (all chatgpt, claude, gemin) equally good at perl heredocs in immediate assignment or structured hash object

