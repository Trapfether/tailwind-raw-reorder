// @ts-check
/**
 * @typedef {{
 * getClassOrder?: (classes: string[])=>[string, number|null][]
 * tailwindConfig: any,
 * layerOrder: any,
 * }} Context
 */

/**
 * @typedef {{generateRules: (classes: Set<string>, context: Context)=>[number, any][], context: Context}} Env
 */


/**
 * @param {bigint | number} bigIntValue
 * @returns {number}
 */
export function bigSign(bigIntValue) {
  const a = (bigIntValue > 0n) ? 1 : 0;
  const b = (bigIntValue < 0n) ? 1 : 0;
  return  a - b;
}

/**
 * @param {Context} context
 * @param {string} selector
 */
function prefixCandidate(context, selector) {
  let prefix = context.tailwindConfig.prefix
  return typeof prefix === 'function' ? prefix(selector) : prefix + selector
}

// Polyfill for older Tailwind CSS versions
/**
 * @param {string[]} classes
 * @param {{env: Env}} options
 */
function getClassOrderPolyfill(classes, { env }) {
  // A list of utilities that are used by certain Tailwind CSS utilities but
  // that don't exist on their own. This will result in them "not existing" and
  // sorting could be weird since you still require them in order to make the
  // host utitlies work properly. (Thanks Biology)
  let parasiteUtilities = new Set([
    prefixCandidate(env.context, 'group'),
    prefixCandidate(env.context, 'peer'),
  ])

  /** @type {[string, number][]} */
  let classNamesWithOrder = [];

  for (let className of classes) {
    let rules = env
    .generateRules(new Set([className]), env.context);
    let order = rules.sort(([a], [z]) => bigSign(z - a))[0]?.[0] ?? null

    if (order === null && parasiteUtilities.has(className)) {
      // This will make sure that it is at the very beginning of the
      // `components` layer which technically means 'before any
      // components'.
      order = env.context.layerOrder.components
    }

    classNamesWithOrder.push([className, order])
  }

  return classNamesWithOrder
}

/**
 * @param {string} classStr
 * @param {{ seperator?: RegExp; replacement?: string; env: any }} options
 */
export function sortClasses(
  classStr,
  { seperator, replacement, env },
) {
  if (typeof classStr !== 'string' || classStr === '') {
    return classStr
  }

  // Ignore class attributes containing `{{`, to match Prettier behaviour:
  // https://github.com/prettier/prettier/blob/main/src/language-html/embed.js#L83-L88
  if (classStr.includes('{{')) {
    return classStr
  }

  let result = ''
  let classes = classStr.split(seperator || /\s+/g).filter(t=>t);

  if (classes[classes.length - 1] === '') {
    classes.pop()
  }

  classes = sortClassList(classes, { env })

  for (let i = 0; i < classes.length; i++) {
    result += `${classes[i]}${replacement ?? ' '}`
  }

  return result.trim()
}

/**
 * @param {string[]} classList
 * @param {{ env: Env }} options
 */
export function sortClassList(classList, { env }) {
  let classNamesWithOrder = env.context.getClassOrder
    ? env.context.getClassOrder(classList)
    : getClassOrderPolyfill(classList, { env })

  return classNamesWithOrder
    .sort(([, a], [, z]) => {
      if (a === z) return 0
      // if (a === null) return options.unknownClassPosition === 'start' ? -1 : 1
      // if (z === null) return options.unknownClassPosition === 'start' ? 1 : -1
      if (a === null) return -1
      if (z === null) return 1
      return bigSign(a - z)
    })
    .map(([className]) => className)
}
