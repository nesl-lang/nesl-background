haiku screws up the IDS big time -- 1 out of 6 times for me

https://claude.ai/chat/f3acccce-bde9-4221-92fe-44614d429d4e



```

#!telt [3CharHash: abc]
// write the content to the file for various purposes
=== CREATE_FILE ===
--FILE abc--
path/to/new.txt
--CONTENT abc--
Hello, World!
--END abc--


#!telt [3CharHash: h4t]
//here's a description of what we're doing
=== BASH ===
ls -al
--END h4t--

#!telt [3CharHash: d83]
//here's a description of what we're doing
=== BASH:5.0 ===
ls -al
--END d83--

#!telt [3CharHash: a42]
//here's a description of what we're doing
=== EXEC ===
npm install
--END a42--




#!telt [3CharHash: 83m]
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
