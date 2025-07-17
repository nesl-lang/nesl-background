
#!telt delimHash3: def
//here's a description of what we're doing
--RUN--
type: exec
--COMMAND def--
npm install
--END def--

#!telt delimHash3: 875
//here's a description of what we're doing
--RUN--
type: bash
--COMMAND def--
ls -al
--END 875--




#!telt delimHash3: d83
//here's a description of what we're doing
--RUN--
--BASH:5.0--
ls -al
--END d83--

#!telt delimHash3: a42
//here's a description of what we're doing
--RUN--
--EXEC--
npm install
--END a42--
