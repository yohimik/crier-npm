import {execFileSync} from 'node:child_process';

const [base, head = 'HEAD', version = 'dev', name = 'my-app'] = process.argv.slice(2);
if (!base) throw new Error('Usage: node from-git.mjs BASE [HEAD] [VERSION] [PACKAGE]');
// Run this from the repository whose release you are announcing.
const log = execFileSync('git', ['log', '--reverse', '--format=%s%x00%b%x00', `${base}..${head}`, '--'], {encoding: 'utf8'});
const parts = log.split('\0');
const groups = {Breaking: [], Features: [], Fixes: [], Other: []};
for (let i = 0; i + 1 < parts.length; i += 2) {
  const subject = parts[i].trim();
  const body = parts[i + 1];
  if (!subject) continue;
  const match = /^([a-z]+)(?:\([^)]*\))?(!)?:\s*(.*)$/i.exec(subject);
  const text = match ? match[3] : subject;
  const group = match?.[2] || /^BREAKING[ -]CHANGE:/m.test(body) ? 'Breaking'
    : match?.[1] === 'feat' ? 'Features' : match?.[1] === 'fix' ? 'Fixes' : 'Other';
  groups[group].push(text);
}
process.stdout.write(JSON.stringify({
  package: name, version, summary: 'What changed in this release.',
  sections: Object.entries(groups).filter(([, items]) => items.length)
    .map(([label, items]) => ({label, items}))
}, null, 2) + '\n');
