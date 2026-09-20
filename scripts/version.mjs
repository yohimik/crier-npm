import {readFile, writeFile} from 'node:fs/promises';

const version = process.env.DISPAT_NEW_VERSION;
if (!version || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(version)) {
  throw new Error('DISPAT_NEW_VERSION must be an exact version');
}
const file = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(await readFile(file, 'utf8'));
pkg.version = version;
await writeFile(file, `${JSON.stringify(pkg, null, 2)}\n`);
