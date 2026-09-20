import {readFile, writeFile} from 'node:fs/promises';
import {verifyArtifact} from '../build/scripts/pack.js';
import {publish} from '../build/scripts/publish.js';

const operation = process.argv[2];
if (!['approve', 'verify-artifact', 'publish'].includes(operation)) {
  throw new Error('Expected approve, verify-artifact, or publish');
}
const artifact = await verifyArtifact();
const receipt = new URL('../.release/tested.json', import.meta.url);
if (operation === 'approve') {
  await writeFile(receipt, `${JSON.stringify(artifact, null, 2)}\n`);
} else {
  const tested = JSON.parse(await readFile(receipt, 'utf8'));
  for (const key of ['tarball', 'integrity', 'name', 'version']) {
    if (tested[key] !== artifact[key]) throw new Error(`Tested artifact ${key} no longer matches`);
  }
  if (operation === 'publish') await publish({tarball: artifact.tarball});
}
console.log(`${operation}: ${artifact.name}@${artifact.version}`);
