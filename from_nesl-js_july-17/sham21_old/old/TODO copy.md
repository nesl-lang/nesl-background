add this test. it should parse fine. valid to have block end marker as literal text in heredoc.  everything in heredoc is preserved (except the heredoc delimter at start of a line)


content = <<'EOT_SHAM_abc'
Some content here
#!END_SHAM_abc
More content
EOT_SHAM_abc
#!END_SHAM_abc



review the message and error for this: i think the error should just be that its expecting an = but gets a : right? or a more generic malformed error showing that it didn't see what it expected? idk.  what would be industry standard for somethign liek this? check online

 022-invalid-assignment:
   input: | # sham
     #!SHAM [@three-char-SHA-256: inv]
     key := "wrong operator"
     #!END_SHAM_inv
   expected: | # json
     {
       "blocks": [{
         "id": "inv",
         "properties": {},
         "startLine": 1,
         "endLine": 3
       }],
       "errors": [{
         "code": "MALFORMED_ASSIGNMENT",
         "line": 2,
         "column": 1,
         "length": 23,
         "blockId": "inv",
         "content": "key := \"wrong operator\"",
         "context": "#!SHAM [@three-char-SHA-256: inv]\nkey := \"wrong operator\"\n#!END_SHAM_inv",
         "message": "Invalid line format in block 'inv': not a valid key-value assignment, comment, or empty line"
       }]
     }




i think error here should be - unclosed quote error or something

026-newline-in-quoted-string:
   input: | # sham
     #!SHAM [@three-char-SHA-256: nwl]
     key = "line1
     line2"
     #!END_SHAM_nwl
   expected: | # json
     {
       "blocks": [{
         "id": "nwl",
         "properties": {},
         "startLine": 1,
         "endLine": 4
       }],
       "errors": [{
         "code": "NEWLINE_IN_QUOTE",
         "line": 2,
         "column": 14,
         "length": 1,
         "blockId": "nwl",
         "content": "key = \"line1",
         "context": "#!SHAM [@three-char-SHA-256: nwl]\nkey = \"line1\nline2\"\n#!END_SHAM_nwl",
         "message": "Quoted string contains newline"
       }]
     }



no this would treat the block-end marker as literal text of the heredoc.  the parser would attempt to collect the heredoc through the end of the file and then the error would be that the heredoc was never closed


 027-unclosed-heredoc:
   input: | # sham
     #!SHAM [@three-char-SHA-256: uhd]
     content = <<'EOT_SHAM_uhd'
     Some content
     #!END_SHAM_uhd
   expected: | # json
     {
       "blocks": [{
         "id": "uhd",
         "properties": {},
         "startLine": 1,
         "endLine": 4
       }],
       "errors": [{
         "code": "UNCLOSED_HEREDOC",
         "line": 4,
         "column": 1,
         "length": 14,
         "blockId": "uhd",
         "content": "#!END_SHAM_uhd",
         "context": "#!SHAM [@three-char-SHA-256: uhd]\ncontent = <<'EOT_SHAM_uhd'\nSome content\n#!END_SHAM_uhd",
         "message": "Heredoc not closed before block end"
       }]
     }


big update: NO COMMENTS. NO COMMENTS ALLOWED.  we need to overhaul everythig so that comments are not even part of it anymore