import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

const publicDir = 'public';
const outputDir = '.output/public';

function copyDir(src, dest) {
  try {
    mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src);
    
    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      
      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
        console.log(`✓ Copied ${destPath}`);
      }
    }
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}:`, err.message);
  }
}

try {
  copyDir(publicDir, outputDir);
  console.log('✓ Public assets copied successfully');
} catch (err) {
  console.error('Failed to copy public assets:', err.message);
  process.exit(1);
}
