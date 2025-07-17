
```php
$operations1 = [
    [
        'action' => 'create_file',
        'path' => '/tmp/hello.txt',
        'content' => <<<'TEXT'
 Hello world!
 how are you?
TEXT
    ],
    [
        'dothing' => 'true',
        'count' => 3,
        'str' => <<<'STRING'
   
 asdf "awef" 'lkj'
lalalala 

STRING
    ]
];
```

---

```php
$data1 = [
    'name' => 'hildebrand',
    'age' => 7,
    'p1' => <<<'EOT'
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
EOT,
    'p2' => <<<'EOT'
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
EOT
];
```

```php
$operations2 = [
    [
        'action' => 'create_turtle_info',
        'type' => 'breathing',
        'content' => <<<'EOT'
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
EOT,
        'priority' => 'high',
    ],
    [
        'action' => 'append_turtle_info',
        'type' => 'respiration',
        'content' => <<<'EOT'
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv(summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
EOT,
        'validate' => 1,
    ],
    [
        'action' => 'create_metadata',
        'author' => 'hildebrand',
        'age' => 7,
        'description' => <<<'DESC'
Research notes on turtle respiratory systems
     compiled from various sources
DESC,
        'tags' => ['biology', 'reptiles', 'aquatic'],
    ]
];
```

```php
$poemblock = [
    [
        'content' => <<<'TEXT'

  
 Roses are red

 Violets are blue  
  
TEXT
    ]
];
```


please convert the above php code sections to perl syntax sections using literal non-interpolating heredocs with custom delimiters when appropriate.  use this particular perl syntax to indicate end of each perl code and always unique delimiters per code block:

```perl
#!/usr/bin/perl # @three-char-SHA-256: q9r
use strict;
use warnings;

my $name = "Alice";
my $age = 42;

my $config = <<'BLOCK_q9r';
database: production
timeout: 30
retry: true
BLOCK_q9r

my $message = <<'BLOCK_q9r';
Dear User,
Your account has been updated.
Please verify your settings.
BLOCK_q9r

__END__[q9r]
Script for user notification system
```


##############################################################################
##############################################################################
##############################################################################


❌
✅

4b     : ❌
12b    : ❌
27b    : ✅
2.0fl  : ❌     missing poem line 
2.0f   : ✅
2.5fl  : ❌     wrong id from top comment only
2.5f   : ✅
2.5p   : ✅
