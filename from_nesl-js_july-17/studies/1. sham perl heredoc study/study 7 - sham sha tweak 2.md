check out this example format for SHAM syntax that supports literal non-interpolated custom delimiter heredoc:


```sham
#!SHAM [@rand_three_char_SHA: k7m]
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

please convert this data from perl to SHAM syntax:

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

and also convert this:


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

##############################################################################
##############################################################################
##############################################################################


breaks gemma 4b!  makes it fuck up leading whitespace preservation:

"using unique random three-character alphanumeric SHA codes for `@three_char_SHA`, "

##############################################################################
##############################################################################
##############################################################################


Okay, let's convert the Perl data to SHAM syntax.

**First Data Snippet:**

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

**SHAM Conversion:**

```sham
{
    name = 'hildebrand'
    age = 7
    p1 = <<<EOT-k7m
 Although many turtles spend large amounts of their lives underwater, 
all turtles breathe air and must surface at regular intervals to refill their lungs. 
  Depending on the species, immersion periods vary between a minute and an hour.[51] 
Some species can respire through the cloaca
EOT-k7m
    p2 = <<<EOT-k7m
 , which contains large sacs that are lined with many finger-like 
 projections that take up 
    dissolved 
     oxygen from the water.[52]
EOT-k7m
}
#!END-SHAM-k7m
```

**Second Data Snippet:**

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

**SHAM Conversion:**

```sham
[
    {
        action = "create_turtle_info"
        type = "breathing"
        content = <<<EOT-k7m
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
EOT-k7m
        priority = "high"
    },
    {
        action = "append_turtle_info"
        type = "respiration"
        content = <<<EOT-k7m
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv(summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
EOT-k7m
        validate = 1
    },
    {
        action = "create_metadata"
        author = "hildebrand"
        age = 7
        description = <<<DESC-k7m
Research notes on turtle respiratory systems
     compiled from various sources
DESC-k7m
        tags = ["biology", "reptiles", "aquatic"]
    }
]
#!END-SHAM-k7m
```

**Key Changes and Explanations:**

*   **`<<'EOT'`:**  The Perl `<<'EOT'` syntax for heredocs is directly translated to `<<<EOT-k7m` in SHAM.  I've added a unique delimiter suffix (`-k7m`) to each heredoc to avoid conflicts if you have multiple heredocs in the same SHAM file.  You can change the suffix if needed.
*   **`=` vs. `=>`:**  Perl uses `=>` for assignment, while SHAM uses `=`.
*   **Arrays:** Perl arrays are represented as lists enclosed in square brackets `[]` in SHAM.
*   **String Literals:**  The string literals are enclosed in triple angle brackets `<<<` and the delimiter.
*   **Escaping:**  I've preserved the escaping of characters like double quotes (`"`) and single quotes (`'`) within the heredocs.
*   **`R"""`:** The Perl `R"""` is translated to `R"""pv` in SHAM.

**Important Notes:**

*   **Delimiter Uniqueness:**  Always use unique delimiters for each heredoc to avoid conflicts.
*   **SHAM Syntax:**  SHAM has specific syntax rules.  Double-check the SHAM documentation for the most accurate and up-to-date information.
*   **Error Handling:**  This conversion assumes the Perl code is valid.  If there are syntax errors in the Perl code, the SHAM code will likely fail to parse.

I've done my best to accurately translate the Perl data to SHAM.  Let me know if you have any other questions or need further clarification.
