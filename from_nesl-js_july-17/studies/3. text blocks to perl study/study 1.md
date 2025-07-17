
# Group 0:

```seach

  
 Roses are red

 Violets are blue  
  
```

```replace


  
Roses are red

Violets are blue  
  
```

# Group 1:

```search
 Hello world!
 how are you?
```

```replace
   
 asdf "awef" 'lkj'
lalalala 

```

# Group 2:

```search
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
```

```replace
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
```

# Group 3:

```search
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
```

```replace
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv(summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
```

# Group 4:

```search
 Research notes on turtle respiratory systems
 compiled from various sources
```

```replace
Research notes on turtle respiratory systems
     compiled from various sources
```

each group above contains a raw literal text blocks for "search" and  "replace" text.  format each group as perl syntax sections using literal non-interpolating heredocs with custom delimiters when appropriate.  use a separate perl section per "Group" shown above. use this particular perl syntax below to indicate end of each perl code and always use unique delimiter ids (@three-char-SHA-256) per code block. notice that each perl code block must end with the `__END__[<three-char-SHA-256>]` line

```perl
#!/usr/bin/perl # @three-char-SHA-256: q9r
my $search = <<'EOT_q9r';
search text line 1
search text line 2
EOT_q9r
my $replace = <<'EOT_q9r';
replace text line 1
replace text line 2
EOT_q9r
__END__[q9r]
```


##############################################################################
##############################################################################
##############################################################################



❌
✅

c4.1m  : ❌
c4.1   : ✅
4b     : 
12b    : 
27b    : 
2.0fl  : ❌
2.0f   : ✅
2.5fl  : ❌
2.5f   : ❌
2.5p   : ✅
