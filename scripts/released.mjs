import {appendFile, readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const release = JSON.parse(await readFile(new URL('release.json', root), 'utf8'));
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT,
    `npm-released=true\nnpm-version=${pkg.version}\nnpm-binary-version=${release.version}\n`);
}
console.log(`published ${pkg.name}@${pkg.version} (native Crier ${release.version})`);
