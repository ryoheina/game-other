import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

const publicDir = "public";
const outputDir = existsSync(".output/server") ? ".output/public" : ".vercel/output/static";

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`Copied ${destPath}`);
    }
  }
}

try {
  copyDir(publicDir, outputDir);
  console.log("Public assets copied successfully");
} catch (error) {
  console.error("Failed to copy public assets:", error);
  process.exit(1);
}
