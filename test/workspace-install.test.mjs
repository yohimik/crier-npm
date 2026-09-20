import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

function fixture(t, source, manifest = JSON.stringify({name: '@dispat/crier'})) {
  const root = mkdtempSync(path.join(tmpdir(), 'crier workspace install '));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const cli = path.join(root, 'package');
  mkdirSync(cli, {recursive: true});
  cpSync(new URL('../postinstall.mjs', import.meta.url), path.join(cli, 'postinstall.mjs'));
  if (source) {
    mkdirSync(path.join(cli, 'src/bin'), {recursive: true});
    writeFileSync(path.join(cli, 'src/bin/postinstall.ts'), '');
    writeFileSync(path.join(cli, 'package.json'), manifest);
  }
  return cli;
}

// The installer a package carries when it is not this repository's checkout:
// it records that it ran and fails, so a test can tell "installed" from
// "silently skipped" without a network.
function installer(cli) {
  mkdirSync(path.join(cli, 'build/bin'), {recursive: true});
  writeFileSync(path.join(cli, 'build/bin/postinstall.js'),
    'exports.runPostinstall = async function () { console.error("missing release metadata"); process.exitCode = 17; }');
}

test('source checkout installation needs neither a compiled CLI nor release metadata', t => {
  const cli = fixture(t, true);
  assert.equal(execFileSync(process.execPath, [path.join(cli, 'postinstall.mjs')], {encoding: 'utf8'}), '');
});

// The copies above are the only way to build a workspace that is not this one.
// This runs the file itself, in its own folder, which is what `npm install`
// does here and the one case the coverage gate can attribute to the source.
test('this checkout is its own source checkout, which is what npm install runs', () => {
  const real = fileURLToPath(new URL('../postinstall.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [real], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('a distributed package still invokes its installer and preserves failure', t => {
  const cli = fixture(t, false);
  installer(cli);
  const result = spawnSync(process.execPath, [path.join(cli, 'postinstall.mjs')], {encoding: 'utf8'});
  assert.equal(result.status, 17);
  assert.match(result.stderr, /missing release metadata/);
});

test('a malformed package manifest fails closed', t => {
  const cli = fixture(t, true, '{"name": "@dispat/crier"');
  installer(cli);
  const result = spawnSync(process.execPath, [path.join(cli, 'postinstall.mjs')], {encoding: 'utf8'});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ERR_INVALID_PACKAGE_CONFIG/);
});

test('another repository\'s workspace is not this one, and installs', t => {
  const cli = fixture(t, true, JSON.stringify({name: 'somebody-elses-monorepo'}));
  installer(cli);
  const result = spawnSync(process.execPath, [path.join(cli, 'postinstall.mjs')], {encoding: 'utf8'});
  assert.equal(result.status, 17, result.stderr);
  assert.match(result.stderr, /missing release metadata/);
});

test('an incomplete distributed package cannot pass as a source checkout', t => {
  const cli = fixture(t, false);
  mkdirSync(path.join(cli, 'src/bin'), {recursive: true});
  writeFileSync(path.join(cli, 'src/bin/postinstall.ts'), '');
  const result = spawnSync(process.execPath, [path.join(cli, 'postinstall.mjs')], {encoding: 'utf8'});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ERR_MODULE_NOT_FOUND/);
});
