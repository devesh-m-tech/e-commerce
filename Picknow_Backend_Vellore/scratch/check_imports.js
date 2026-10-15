import fs from 'fs';
import path from 'path';

const dirs = ['routes', 'controllers', 'models', 'middleware', 'database', 'utils'];
for (const dir of dirs) {
  const p = path.join(process.cwd(), dir);
  if (!fs.existsSync(p)) continue;
  const files = fs.readdirSync(p).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const filePath = path.join(p, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+.*?from\s+['"](\.[^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imp = match[1];
      if (!imp.endsWith('.js') && !imp.endsWith('.json')) {
        console.log('MISSING .js in', dir + '/' + f, '->', imp);
      }
    }
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      console.log('FOUND require() in ES Module:', dir + '/' + f, '->', match[1]);
    }
  }
}
