'use strict'

import path from 'node:path'
import { spawn } from 'node:child_process'
import { binaryName } from '#root/lib/platform.js'
import { PACKAGE_ROOT } from '#root/lib/root.js'
import type { ChildProcess, SpawnOptions } from 'node:child_process'

const VALUE_FLAGS = new Set(['release', 'api-url', 'token-env'])
const BOOL_FLAGS = new Set(['check', 'rollback', 'prerelease', 'json'])

interface Invocation {
  command: string
  commandIndex: number
  booleans: Map<string, boolean>
}

interface LaunchOptions {
  packageDir?: string
  platform?: NodeJS.Platform
  spawn?: (file: string, args: readonly string[], options: SpawnOptions) => ChildProcess
}

function shellQuote(value: string, platform: NodeJS.Platform = process.platform): string {
  if (platform === 'win32') return `'${value.replaceAll("'", "''")}'`
  return `'${value.replaceAll("'", `'"'"'`)}'`
}

function repairCommand(packageDir: string, platform: NodeJS.Platform = process.platform): string {
  const command = `${shellQuote(process.execPath, platform)} ${shellQuote(path.join(packageDir, 'build/bin/postinstall.js'), platform)}`
  return platform === 'win32' ? `& ${command}` : command
}

function repairInstruction(packageDir: string, platform: NodeJS.Platform = process.platform, verb = 'repair'): string {
  const shell = platform === 'win32' ? ' in PowerShell' : ''
  return `${verb} this exact installation${shell} with:\n  ${repairCommand(packageDir, platform)}`
}

function invocation(args: readonly string[]): Invocation {
  // Crier dispatches solely on argv[0]. Leading flags belong to publish.
  const first = args[0] || ''
  const command = ['-h', '--help', '-help'].includes(first) ? 'help'
    : ['--version', '-version'].includes(first) ? '--version'
    : !first || first.startsWith('-') ? 'publish' : first
  const booleans = new Map<string, boolean>()
  if (command === 'self-update') {
    // Match Go's flag parser: both dash spellings, last boolean value wins,
    // string values consume the next argument, and parsing stops at --/args.
    for (let i = 1; i < args.length; i++) {
      const arg = args[i]
      if (arg === '--' || !arg.startsWith('-') || arg === '-') break
      const [name, raw] = arg.replace(/^--?/, '').split('=', 2)
      if (name === 'h' || name === 'help') {
        booleans.set('--help', true)
        break
      }
      if (VALUE_FLAGS.has(name)) { if (raw === undefined) i++; continue }
      if (!BOOL_FLAGS.has(name)) break
      if (raw !== undefined && !/^(?:1|0|t|T|true|TRUE|True|f|F|false|FALSE|False)$/.test(raw)) break
      booleans.set(`--${name}`, raw === undefined || ['1', 't', 'T', 'true', 'TRUE', 'True'].includes(raw))
    }
  }
  return { command, commandIndex: first ? 0 : -1, booleans }
}

function commandOf(args: readonly string[]): string { return invocation(args).command }
function booleanFlag(args: readonly string[], name: string): boolean { return invocation(args).booleans.get(name) || false }

function launch(args: string[] = process.argv.slice(2), options: LaunchOptions = {}): ChildProcess | number {
  const parsed = invocation(args)
  if (parsed.command === 'self-update' && !parsed.booleans.get('--help') && !parsed.booleans.get('--check')) {
    process.stderr.write('crier: self-update is managed by npm. Run `npm update @dispat/crier` locally or `npm install -g @dispat/crier@latest --allow-scripts=@dispat/crier` globally. To force or roll back, install an explicit version such as `npm install -g @dispat/crier@1.1.0 --allow-scripts=@dispat/crier`.\n')
    return 2
  }
  const packageDir = options.packageDir || PACKAGE_ROOT
  const binary = path.join(packageDir, binaryName(options.platform))
  let child
  try {
    child = (options.spawn || spawn)(binary, args, {
      cwd: process.cwd(), env: { ...process.env }, stdio: 'inherit', windowsHide: false
    })
  } catch (error) { return missing(binary, asError(error), packageDir, options.platform) }
  const handlers = new Map<NodeJS.Signals, () => void>()
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as NodeJS.Signals[]) {
    const handler = () => { if (!child.killed) child.kill(signal) }
    handlers.set(signal, handler)
    process.once(signal, handler)
  }
  const cleanup = () => { for (const [signal, handler] of handlers) process.removeListener(signal, handler) }
  child.on('error', (error: Error) => { cleanup(); process.exitCode = missing(binary, error, packageDir, options.platform) })
  child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
    cleanup()
    if (signal) {
      try { process.kill(process.pid, signal) } catch (_) { process.exitCode = 1 }
    } else process.exitCode = code == null ? 1 : code
  })
  return child
}

function missing(binary: string, error: Error, packageDir: string, platform?: NodeJS.Platform): number {
  process.stderr.write(`crier: could not launch ${binary}: ${error.message}\n`)
  process.stderr.write(`crier: the install script may have been blocked; ${repairInstruction(packageDir, platform)}\n`)
  return 1
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

export { launch, invocation, commandOf, booleanFlag, repairCommand, repairInstruction, shellQuote, VALUE_FLAGS }
