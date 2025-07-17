tried with 6 haikus... all the ids are correct now

no actually sometimes starts using words for the hash, not random

https://claude.ai/chat/ede175e5-e9b6-4b21-b675-c24ed2cfa7f9


```

#!telt [three_char_hash: abc]
// write the content to the file for various purposes
=== CREATE_FILE ===
--FILE abc--
path/to/new.txt
--CONTENT abc--
Hello, World!
--END abc--


#!telt [three_char_hash: h4t]
//here's a description of what we're doing
=== BASH ===
ls -al
--END h4t--

#!telt [three_char_hash: d83]
//here's a description of what we're doing
=== BASH:5.0 ===
ls -al
--END d83--

#!telt [three_char_hash: a42]
//here's a description of what we're doing
=== EXEC ===
npm install
--END a42--




#!telt [three_char_hash: 83m]
=== REPLACE_IN_FILE ===
--FILE 83m--
src/index.js
--MODES 83m--
overwrite, 
--FIND 83m--
import React from 'react';
import ReactDOM from 'react-dom';
--REPLACE 83m--
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
--END 83m--

```

check out the above new syntax language.  generate some more examples for it.  after you generate 5 basic examples, generate some more longer ones and ones requiring multiple attribute blocks like for editing a file. claude,  dont use an artifact. 
