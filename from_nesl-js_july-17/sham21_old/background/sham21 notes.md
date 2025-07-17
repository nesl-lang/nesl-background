what to name sham? 


SHAM parsing requirmements:

keys limited to `AZaz09_`
state machine
line-based

error... fail safe vs fail fast...
- we wan tit to work well in an IDE so it shows as many red squiggle lines as it reasonably can in order to be useful to the human writer 
- also want it to report back to the LLM witing the code all the errors it finds to minimize back and forth revisions between the ai coder LLM model and the parser

we need  to think abour error cases.  human readable error codes, not numbers.  

for errors, we need to give file-based line number for the error.  and need to be able to also say the ID for the block its in.  and need to share the "content", the line that has the error. a nd also a "context" multiline string var that's a 5-line shifting window of lines that attempts to put the "content" line in the middle, but adjusts accordingly if the target line is too close to the end or start of the file, or if the file is shorter than 5 lines

test cases - as language-agnostic intput/output files.  even unit tests for implementation functions will have their test cases represented as files in the sham-test dir that is shared with all parsers.  bc i'll be writing multiple parsers and they'll all follow basically the same algorithm.  so unit tests for functions will use the same expectations etc

NOT SUPPORTED:  arrays or objects

heredoc values always pure raw literal text, all whitespace preserved verbatim

no primitive values.  all values are either quoted string or heredoc

no nesting
