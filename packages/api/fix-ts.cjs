const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove type annotations after function params: ): type {
  content = content.replace(/\):\s*([a-zA-Z\[\]<>]+)\s*([{,])/g, ')$2');
  content = content.replace(/\):\s*([a-zA-Z\[\]<>]+)\s*([{]\s*$)/gm, ') {');

  // Remove type annotations in variable declarations: const x: type =
  content = content.replace(/const\s+([a-zA-Z_$][a-zA-Z0-9_$]*):\s*[a-zA-Z\[\]<>{}]+\s*=/g, 'const $1 =');

  // Remove 'as' type casting: expr as Type
  content = content.replace(/\s+as\s+[a-zA-Z\[\]<>]+/g, '');

  // Remove generic type parameters: Type<T> or Type<T, U>
  content = content.replace(/<[a-zA-Z\[\],<> ]+>/g, '');

  // Remove optional marker from object properties
  content = content.replace(/\?:\s*/g, ': ');

  // Comment out interface declarations
  content = content.replace(/^export\s+interface\s+\w+/gm, '// export interface');
  content = content.replace(/^export\s+type\s+\w+/gm, '// export type');

  // Remove type annotations from export const
  content = content.replace(/export\s+const\s+(\w+):\s*[a-zA-Z\[\]<>{}]+\s*=/g, 'export const $1 =');

  // Fix Record type annotations more broadly
  content = content.replace(/:\s*Record<[^>]+>/g, '');
  content = content.replace(/Record<[^>]+>/g, '');

  // Fix string[] type annotations
  content = content.replace(/:\s*\w+\[\]/g, '');

  // Fix octal literals like 032 (only in object values)
  content = content.replace(/:\s*0(\d{2,})/g, ': $1');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.js')) {
      processFile(filePath);
    }
  }
}

walkDir('./src');
console.log('Done!');
