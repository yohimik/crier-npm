import {existsSync, readFileSync} from 'node:fs';

// Source checkouts compile locally. Published packages never include src/.
const source = new URL('./src/bin/postinstall.ts', import.meta.url);
const manifest = new URL('./package.json', import.meta.url);

function isSourceManifest(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8')).name === '@dispat/crier';
  } catch {
    return false;
  }
}

if (!(existsSync(source) && isSourceManifest(manifest))) {
  const {runPostinstall} = await import('./build/bin/postinstall.js');
  await runPostinstall();
}
