const fs = require('fs');
const content = fs.readFileSync('demo/lib/raw_kb.txt', 'utf8');
const escaped = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
fs.writeFileSync('demo/lib/kb.ts', 'export const KB_TEXT = `\n' + escaped + '\n`;\n');
