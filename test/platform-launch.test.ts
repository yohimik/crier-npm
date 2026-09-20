import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import type { ChildProcess, SpawnOptions } from 'node:child_process'
import { platformKey, binaryName } from '#root/lib/platform.js'
import { commandOf, booleanFlag, launch, repairCommand, repairInstruction, shellQuote } from '#root/lib/launch.js'

function fakeChild(): ChildProcess {
  return Object.assign(new EventEmitter(), { killed: false, kill() { this.killed = true; return true } }) as unknown as ChildProcess
}

test('maps every supported platform and architecture', () => {
  for (const [os, arch, key] of [['linux','x64','linux-x64'],['linux','arm64','linux-arm64'],['darwin','x64','darwin-x64'],['darwin','arm64','darwin-arm64'],['win32','x64','win32-x64'],['win32','arm64','win32-arm64']]) assert.equal(platformKey(os, arch), key)
  assert.equal(binaryName('win32'), 'crier-native.exe'); assert.equal(binaryName('linux'), 'crier-native')
  assert.throws(() => platformKey('freebsd', 'x64'), /unsupported platform/)
  assert.throws(() => platformKey('linux', 'ia32'), /unsupported platform/)
})

test('matches crier first-argument dispatch', () => {
  assert.equal(commandOf([]), 'publish')
  assert.equal(commandOf(['--config', 'self-update']), 'publish')
  assert.equal(commandOf(['render', 'self-update']), 'render')
  assert.equal(commandOf(['--', 'self-update']), 'publish')
  assert.equal(commandOf(['self-update']), 'self-update')
  for (const arg of ['--help', '-help', '-h']) assert.equal(commandOf([arg]), 'help')
  for (const arg of ['--version', '-version']) assert.equal(commandOf([arg]), '--version')
})

test('self-update flags follow Go flag parsing', () => {
  const check = (...args: string[]) => booleanFlag(['self-update', ...args], '--check')
  assert.equal(check('--check', '-check=false'), false)
  assert.equal(check('--check=false', '-check'), true)
  for (const value of ['1', 't', 'T', 'true', 'TRUE', 'True']) assert.equal(check(`--check=${value}`), true)
  for (const value of ['0', 'f', 'F', 'false', 'FALSE', 'False', 'TrUe']) assert.equal(check(`--check=${value}`), false)
  assert.equal(check('--token-env', '--check'), false)
  assert.equal(check('-release', '--check'), false)
  assert.equal(check('--release=1.1.0', '--check'), true)
  assert.equal(check('--', '--check'), false)
  assert.equal(check('positional', '--check'), false)
  assert.equal(check('-', '--check'), false)
  assert.equal(check('--unknown', '--check'), false)
  assert.equal(check('--check=false', '--check=invalid'), false)
  for (const arg of ['-h', '--help', '-help', '--help=false']) {
    assert.equal(booleanFlag(['self-update', arg], '--help'), true)
  }
  assert.equal(booleanFlag(['self-update', '--token-env', '--help'], '--help'), false)
})

test('launcher preserves argv, environment and exit status', async () => {
  const child = fakeChild()
  let call: { file: string, args: readonly string[], options: SpawnOptions } | undefined
  const result = launch(['status', '--json'], { packageDir: '/a path', platform: 'linux', spawn(file, args, options) { call = { file, args, options }; return child } })
  assert.equal(result, child); assert.ok(call); assert.equal(call.file, '/a path/crier-native'); assert.deepEqual(call.args, ['status', '--json'])
  assert.equal(call.options.stdio, 'inherit'); assert.equal(call.options.cwd, process.cwd()); assert.equal(call.options.env?.PATH, process.env.PATH)
  child.emit('exit', 17, null); assert.equal(process.exitCode, 17); process.exitCode = 0
})

test('launcher permits read-only self-update forms and rejects mutations', () => {
  for (const args of [['self-update','--check'],['self-update','--rollback','--check=true'],['self-update','--help'],['--version','self-update']]) {
    const child = fakeChild()
    assert.equal(launch(args, { spawn: () => child }).constructor, EventEmitter)
    child.emit('exit', 0, null)
  }
  for (const args of [['self-update'],['self-update','--force'],['self-update','--check=false'],['self-update','--check','-check=false']]) assert.equal(launch(args), 2)
  process.exitCode = 0
})

test('launcher reports synchronous and asynchronous spawn failures', () => {
  assert.equal(launch(['status'], { spawn() { throw new Error('no file') } }), 1)
  const child = fakeChild()
  launch(['status'], { spawn: () => child }); child.emit('error', new Error('denied'))
  assert.equal(process.exitCode, 1); process.exitCode = 0
  assert.equal(launch(['status'], { spawn() { throw 'plain spawn failure' } }), 1)
})

test('repair command quotes the exact installation path for the active shell', () => {
  assert.equal(shellQuote("/a path/it's/$HOME/$(nope)", 'linux'), `'/a path/it'"'"'s/$HOME/$(nope)'`)
  assert.equal(shellQuote("C:\\a path\\it's\\%TEMP%", 'win32'), `'C:\\a path\\it''s\\%TEMP%'`)
  const command = repairCommand("/prefix with spaces/lib/node_modules/@dispat/crier", 'linux')
  assert.match(command, /build\/bin\/postinstall\.js'$/)
  assert.match(command, /^'/)
  assert.doesNotMatch(command, /npm root/)
  assert.match(repairCommand("C:\\prefix with %TEMP%\\@crier\\bin", 'win32'), /^& '/)
  assert.match(repairInstruction("C:\\prefix\\@crier\\bin", 'win32'), /in PowerShell with:/)
})
