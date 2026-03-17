const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  'image-converter', 'image-to-pdf', 'merge-pdf', 'pdf-to-word', 'protect-pdf', 'remove-background', 'resize-image', 'unlock-pdf', 'compress-image', 'compress-pdf', 'crop-image'
];

const basePath = path.join(__dirname, '../src/app');

DIRECTORIES.forEach(dir => {
  const pagePath = path.join(basePath, dir, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    // Check if dynamic is already exported
    if (!content.includes('export const dynamic =')) {
      const statement = `export const dynamic = 'force-static';\n`;
      // Find the last import statment and insert after it
      const importMatches = [...content.matchAll(/^import .*;?$/gm)];
      if (importMatches.length > 0) {
        const lastMatch = importMatches[importMatches.length - 1];
        const insertIndex = lastMatch.index + lastMatch[0].length + 1;
        content = content.slice(0, insertIndex) + statement + content.slice(insertIndex);
      } else {
        content = statement + content;
      }
      fs.writeFileSync(pagePath, content);
      console.log(`Updated ${pagePath}`);
    } else {
       console.log(`Skipped ${pagePath} (already has dynamic export)`);
    }
  } else {
      console.log(`File not found: ${pagePath}`);
  }
});
