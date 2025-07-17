g2.0f is the best at perl heredocs:

g2fl fails at everything

##############################
format these text blocks as perl literal heredocs


# Group 0:

```seach

  
 Roses are red

 Violets are blue  
  
```

```replace


  
Roses are red

Violets are blue  
  
```

##############################
```perl
my $group0_search = <<'END_SEARCH';

  
 Roses are red

 Violets are blue  
  
END_SEARCH

my $group0_replace = <<'END_REPLACE';


  
Roses are red

Violets are blue  
  
END_REPLACE
```
##############################
##############################

