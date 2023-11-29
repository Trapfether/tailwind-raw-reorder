// @ts-check
import clearModule from 'clear-module'
import escalade from 'escalade/sync'
import * as path from 'path'
import resolveFrom from 'resolve-from'
import * as fs from 'fs'
// @ts-ignore
import { generateRules as generateRulesFallback } from 'tailwindcss/lib/lib/generateRules'
// @ts-ignore
import { createContext as createContextFallback } from 'tailwindcss/lib/lib/setupContextUtils'
// @ts-ignore
import loadConfigFallback from 'tailwindcss/loadConfig'
// @ts-ignore
import resolveConfigFallback from 'tailwindcss/resolveConfig'
import { expiringMap } from './expiring-map.mjs'

/**
 * @typedef {{context: any, tailwindConfig: any, generateRules: any}} ContextContainer
 */

/**
 * @template K
 * @template V
 * @typedef {import('./expiring-map.mjs').ExpiringMap<K,V>} ExpiringMap
 **/

/** @type {ExpiringMap<string, string | null>} */
let sourceToPathMap = expiringMap(10_000);

/** @type {ExpiringMap<string | null, ContextContainer>} */
let pathToContextMap = expiringMap(10_000);

/**
 * @param {{filepath: string, tailwindConfig?: string}} options
 * @returns {ContextContainer | undefined}
 */
export function getTailwindConfig(options) {
  let key = `${options.filepath}:${options.tailwindConfig ?? ''}`
  let baseDir = getBaseDir(options)

  // Map the source file to it's associated Tailwind config file
  let configPath = sourceToPathMap.get(key);
  if (configPath === undefined) {
    configPath = getConfigPath(options, baseDir)
    if (configPath) {
      sourceToPathMap.set(key, configPath)
    }
  }

  // Now see if we've loaded the Tailwind config file before (and it's still valid)
  let existing = pathToContextMap.get(configPath)
  if (existing) {
    return existing
  }

  // By this point we know we need to load the Tailwind config file
  let result = loadTailwindConfig(baseDir, configPath)

  if (!result) {
    return undefined;
  }

  pathToContextMap.set(configPath, result)

  return result
}

/**
 * @param {{filepath: string, tailwindConfig?: string}} options
 * @returns {string}
 */
function getBaseDir(options) {

  if (options.tailwindConfig) {
    return process.cwd()
  }

  return options.filepath
    ? path.dirname(options.filepath)
    : process.cwd()
}

/**
 *
 * @param {string} baseDir
 * @param {string | null} tailwindConfigPath
 * @returns {ContextContainer | undefined}
 */
function loadTailwindConfig(baseDir, tailwindConfigPath) {
  let createContext = createContextFallback
  let generateRules = generateRulesFallback
  let resolveConfig = resolveConfigFallback
  let loadConfig = loadConfigFallback
  let tailwindConfig = {
    // all html, css, and js files in the workspace
    content: ['**/*.html', '**/*.css', '**/*.js'],
    plugins: [
    ]
  }

  try {
    let pkgDir = path.dirname(resolveFrom(baseDir, 'tailwindcss/package.json'))

    resolveConfig = require(path.join(pkgDir, 'resolveConfig'))
    createContext = require(path.join(
      pkgDir,
      'lib/lib/setupContextUtils',
    )).createContext
    generateRules = require(path.join(
      pkgDir,
      'lib/lib/generateRules',
    )).generateRules

    // Prior to `tailwindcss@3.3.0` this won't exist so we load it last
    loadConfig = require(path.join(pkgDir, 'loadConfig'))
  } catch {
  }

  if (tailwindConfigPath) {
    clearModule(tailwindConfigPath)
    const loadedConfig = loadConfig(tailwindConfigPath)
    tailwindConfig = loadedConfig.default ?? loadedConfig
  } else {
    return undefined;
  }

  // suppress "empty content" warning
  tailwindConfig.content = ['no-op']

  // Create the context
  let context = createContext(resolveConfig(tailwindConfig))

  return {
    context,
    tailwindConfig,
    generateRules,
  }
}

/**
 * @param {{tailwindConfig?: string}} options
 * @param {string} baseDir
 * @returns {string | null}
 */
function getConfigPath(options, baseDir) {
  if (options.tailwindConfig) {
    return path.resolve(baseDir, options.tailwindConfig)
  }

  let configPath
  try {
    // This is a hack because typescript does not correctly resolve the type of the import
    const useEscalade = /** @type {escalade.default} */(/** @type {unknown} */(escalade));
    configPath = useEscalade(baseDir, (_dir, names) => {
      if (names.includes('tailwind.config.js')) {
        return 'tailwind.config.js'
      }
      if (names.includes('tailwind.config.cjs')) {
        return 'tailwind.config.cjs'
      }
      if (names.includes('tailwind.config.mjs')) {
        return 'tailwind.config.mjs'
      }
      if (names.includes('tailwind.config.ts')) {
        return 'tailwind.config.ts'
      }
    })
  } catch {}

  if (configPath) {
    return configPath
  }

  return null
}
