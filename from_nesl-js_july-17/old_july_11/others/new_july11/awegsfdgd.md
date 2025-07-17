asdf


@Edit 
- File: asdf.md
- 

:- 

<<< REPLACE_IN_FILE >>>
File: path/to/file.js
Modes: append 
DelimHash3: _7a9
<<< FIND _7a9>>> 
original content
original content line 2
<<< REPLACE _7a9>>> 
new content
new content line 2
new content line 3
<<< END _7a9>>> 

:-

```
<<< REPLACE_IN_FILE >>>
file: path/to/file.js
modes: append 
delimHash3: 7a9
<<< FIND - 7a9>>> 
original content
original content line 2
<<< REPLACE - 7a9>>> 
new content
new content line 2
new content line 3
<<< END - 7a9>>> 



=== REPLACE_IN_FILE ===
file: path/to/file.js
modes: append 
delimHash3: 7a9
=== FIND - 7a9=== 
original content
original content line 2
=== REPLACE - 7a9=== 
new content
new content line 2
new content line 3
=== END - 7a9=== 


```