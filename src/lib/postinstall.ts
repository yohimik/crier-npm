#!/usr/bin/env node
'use strict'

import { install } from '#root/lib/install.js'
import { repairInstruction } from '#root/lib/launch.js'
import { PACKAGE_ROOT } from '#root/lib/root.js'

interface PostinstallOptions {
  installer?: typeof install
  stderr?: Pick<NodeJS.WriteStream, 'write'>
  env?: NodeJS.ProcessEnv
}

export async function main(options: PostinstallOptions = {}): Promise<number> {
  const stderr = options.stderr ?? process.stderr
  try {
    const { installed } = await (options.installer ?? install)({ log(level, message, fields) {
      if ((options.env ?? process.env).CRIER_NPM_DEBUG || level === 'warn') {
        const detail = Object.keys(fields).length ? ` ${JSON.stringify(fields)}` : ''
        stderr.write(`crier [${level}]: ${message}${detail}\n`)
      }
    } })
    if (installed) stderr.write('crier [info]: installed verified native executable\n')
    return 0
  } catch (error) {
    const failure = error instanceof Error ? error : new Error(String(error))
    stderr.write(`crier [error]: installation failed: ${failure.message}\n`)
    stderr.write(`crier: after fixing the problem, ${repairInstruction(PACKAGE_ROOT, process.platform, 'retry')}\n`)
    if ((options.env ?? process.env).CRIER_NPM_DEBUG) stderr.write(`${failure.stack}\n`)
    return 1
  }
}
