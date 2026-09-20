export const ASSET_NAMES = {
  'darwin-x64': 'crier-darwin-amd64',
  'darwin-arm64': 'crier-darwin-arm64',
  'linux-x64': 'crier-linux-amd64',
  'linux-arm64': 'crier-linux-arm64',
  'win32-x64': 'crier-windows-amd64.exe',
  'win32-arm64': 'crier-windows-arm64.exe'
} as const

export type PlatformKey = keyof typeof ASSET_NAMES

export function isPlatformKey(value: string): value is PlatformKey {
  return Object.hasOwn(ASSET_NAMES, value)
}

export function platformKey(platform: string = process.platform, arch: string = process.arch): PlatformKey {
  const key = `${platform}-${arch}`
  if (!isPlatformKey(key)) throw new Error(`unsupported platform: ${platform}/${arch}; @dispat/crier supports macOS, Linux, and Windows on x64 and ARM64`)
  return key
}

export function binaryName(platform: string = process.platform): string {
  return platform === 'win32' ? 'crier-native.exe' : 'crier-native'
}
