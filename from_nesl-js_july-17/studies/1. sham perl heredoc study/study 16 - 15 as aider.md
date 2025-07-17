


AIDER search/replace block format:

<<<<<<< SEARCH
 Hello world!
 how are you?
=======

   
 asdf "awef" 'lkj'
lalalala 

>>>>>>> REPLACE

AIDER style search/replace blocks preserve all chars and whitespace and newlines etc

example in equivalent perl:


```perl
my @operations = (
   {
       SEARCH => <<'TEXT',
 Hello world!
 how are you?
TEXT
       REPLACE => <<'STRING',

   
 asdf "awef" 'lkj'
lalalala 

STRING
   }
);
```


---
 
please format these literal multiline text string as aider search/replace syntax:

search text block:

```

  
 Roses are red

 Violets are blue  
  
```

replace text block:


```
Roses are red
Violets are blue  
```


##############################################################################
##############################################################################
##############################################################################



❌
✅

c4.1m  : ❌
c4.1   : ❌
co4mh  : ❌
c4.1   : ❌
co4m   : ❌
c4o    : ❌
4b     : ❌
12b    : ❌
27b    : ❌
2.0fl  : ❌
2.0f   : ✅
2.5fl  : ❌
2.5f   : ✅
2.5p   : ✅
