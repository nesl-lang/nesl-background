const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../sham-shared/config.json');

if (!fs.existsSync(configPath)) {
  console.error(`Config file not found: ${configPath}`);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`Failed to parse config: ${err.message}`);
  process.exit(1);
}

const outputPath = path.join(__dirname, '../src/patterns.ts');

const content = `// Generated from sham-shared/config.json - DO NOT EDIT
export const BLOCK_ID_PATTERN = /${config.patterns.blockId}/;
export const KEY_START_PATTERN = /${config.patterns.keyStart}/u;
export const KEY_CHARS_PATTERN = /${config.patterns.keyChars}/u;
export const EXCLUDE_CHARS_PATTERN = /${config.patterns.excludeChars}/;
export const HEREDOC_PREFIX = '${config.patterns.heredocPrefix}';

export const KEY_MAX_LENGTH = ${config.limits.keyMaxLength};
export const BLOCK_ID_LENGTH = ${config.limits.blockIdLength};
export const MAX_FILE_SIZE = ${config.limits.maxFileSize};

export const ERROR_CONTEXT_WINDOW = ${config.parser.errorContextWindow};
export const LINE_ENDING = '${config.parser.lineEnding}';
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content);
console.log('Generated patterns.ts from config.json');