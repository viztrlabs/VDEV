const fs = require('fs');
const content = fs.readFileSync('app/client-dashboard/page.tsx', 'utf8');
const lines = content.split('\n');
let open = [];
let lineNum = 0;
for (const line of lines) {
  lineNum++;
  let i = 0;
  while (i < line.length) {
    if (line[i] === '<' && line[i+1] !== '/' && line[i+1] !== '!' && line[i+1] !== '?') {
      const endIdx = line.indexOf('>', i);
      if (endIdx === -1) { i++; continue; }
      const tag = line.slice(i, endIdx+1);
      if (!tag.includes('/>') && !tag.startsWith('</')) {
        const tagName = tag.slice(1).split(/[\s>]/)[0];
        open.push({tag: tagName, line: lineNum});
      }
      i = endIdx;
    } else if (line[i] === '<' && line[i+1] === '/') {
      const endIdx = line.indexOf('>', i);
      if (endIdx === -1) { i++; continue; }
      const tag = line.slice(i+2, endIdx).trim();
      if (open.length > 0 && open[open.length-1].tag === tag) {
        open.pop();
      } else {
        console.log('Mismatch at line', lineNum, ':', tag, 'expected', open[open.length-1]?.tag);
      }
      i = endIdx;
    }
    i++;
  }
  console.log('Unclosed tags:');
  open.forEach(t => console.log('  Line', t.line, ':', t.tag));
}