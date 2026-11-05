const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'components', 'sections');

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove hover:shadow-[...], group-hover:shadow-[...], shadow-[...]
      content = content.replace(/(?:hover:|group-hover:|focus:|active:)?shadow-\[[^\]]+\]/g, '');
      
      // Remove backdrop-blur-* classes
      content = content.replace(/backdrop-blur(?:-\w+)?/g, '');
      
      // Remove any trailing or extra spaces left inside classNames
      content = content.replace(/ +"/g, '"');
      content = content.replace(/" +/g, '"');
      content = content.replace(/ {2,}/g, ' ');
      
      fs.writeFileSync(fullPath, content);
      console.log(`Processed ${fullPath}`);
    }
  }
}

processDir(dir);
