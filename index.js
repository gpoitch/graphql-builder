const REGEX_FRAGMENT_SPREAD = /\.\.\.(\w+)/g
const REGEX_FRAGMENT_INLINE = /^\s*on/
const REGEX_FRAGMENT_NAME = /fragment\s*(\w+)/
let FragmentMap = {}

function extractFragmentSpreads (query) {
  const fragments = []
  let match
  while ((match = REGEX_FRAGMENT_SPREAD.exec(query)) !== null) {
    const fragmentName = match[1]
    if (!REGEX_FRAGMENT_INLINE.test(fragmentName)) {
      fragments.push(fragmentName)
    }
  }
  return fragments
}

function extractFragmentName (definition) {
  const match = REGEX_FRAGMENT_NAME.exec(definition)
  return match && match[1]
}

function collectFragments (fragments, collection) {
  for (let i = 0, len = fragments.length; i < len; i++) {
    const name = fragments[i]
    const childFragments = FragmentMap[name].fragments
    if (collection.indexOf(name) === -1) {
      collection.push(name)
      childFragments.length && collectFragments(childFragments, collection)
    }
  }
  return collection
}

function reduceFragments (fragments) {
  return collectFragments(fragments, []).reduce((string, name) => (string += '\n' + FragmentMap[name].definition), '')
}

function createOperation (type, opts) {
  if (typeof opts === 'string') {
    return createOperation(type, { definition: opts })
  }

  const { name, variables, definition } = opts
  const operationName = name || ''
  let operationDefinition = name ? `${type} ${name} ` : ''
  if (variables) {
    if (!operationName) {
      operationDefinition = `${type} `
    }
    const params = []
    for (let name in variables) {
      params.push(`$${name}: ${variables[name]}`)
    }
    operationDefinition += `(${params.join(', ')}) `
  }
  operationDefinition += definition

  const fragments = extractFragmentSpreads(definition)
  const fragmentsString = reduceFragments(fragments)
  const toString = function () {
    return `${this.definition}${fragmentsString}`
  }

  return {
    name: operationName,
    definition: operationDefinition,
    fragments,
    document: `${operationDefinition}${fragmentsString}`,
    toString: toString,
    toJSON: toString
  }
}

export function fragment (opts) {
  if (typeof opts === 'string') {
    return fragment({ definition: opts })
  }

  const { name, on, definition } = opts
  const assumedFragmentName = name || on || extractFragmentName(definition)
  const fragmentName = assumedFragmentName + (FragmentMap[assumedFragmentName] ? Object.keys(FragmentMap).length : '')
  const fragmentDefinition = on ? `fragment ${fragmentName} on ${on} ${definition}` : definition

  const fragmentObj = {
    name: fragmentName,
    definition: fragmentDefinition,
    fragments: extractFragmentSpreads(fragmentDefinition),
    toString: () => `...${fragmentName}`
  }

  FragmentMap[fragmentName] = fragmentObj
  return fragmentObj
}

export function query (opts) {
  return createOperation('query', opts)
}

export function mutation (opts) {
  return createOperation('mutation', opts)
}

export function reset () {
  FragmentMap = {}
}
