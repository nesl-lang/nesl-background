import { parseSHAM } from '../src/parser.js';
import fs from 'fs';

const input = `#!SHAM [@three-char-SHA-256: nwl]
key = "line1
line2"
#!END_SHAM_nwl`;

console.log('=== INPUT ===');
console.log(JSON.stringify(input));
console.log('\n=== LINES ===');
const lines = input.split(/\r?\n/);
lines.forEach((line, i) => {
  console.log(`Line ${i+1}: ${JSON.stringify(line)}`);
});

const result = parseSHAM(input);

console.log('\n=== ACTUAL RESULT ===');
console.log(JSON.stringify(result, null, 2));

// Load expected result from integration.md
const integrationMd = fs.readFileSync('./sham-shared/sham-test/integration.md', 'utf8');
const test026Match = integrationMd.match(/### 026-newline-in-quoted-string[\s\S]*?```json\n([\s\S]*?)\n```/);
if (test026Match) {
  const expected = JSON.parse(test026Match[1]);
  console.log('\n=== EXPECTED RESULT ===');
  console.log(JSON.stringify(expected, null, 2));
  
  console.log('\n=== DIFFERENCES ===');
  if (result.errors.length > 0 && expected.errors.length > 0) {
    const actualError = result.errors[0];
    const expectedError = expected.errors[0];
    
    for (const key in expectedError) {
      if (actualError[key] !== expectedError[key]) {
        console.log(`${key}: ${JSON.stringify(actualError[key])} !== ${JSON.stringify(expectedError[key])}`);
      }
    }
  }
}