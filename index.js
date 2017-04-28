const FragmentMap = {}
const REGEX_FRAGMENT_SPREAD = /\.\.\.(\w+)/g
const REGEX_FRAGMENT_INLINE = /^\s*on/
const REGEX_FRAGMENT_NAME = /fragment\s*([_A-Za-z][_0-9A-Za-z]*)\s/

function extractFragmentSpreads (query) {
  const fragments = []
  let match = REGEX_FRAGMENT_SPREAD.exec(query)
  while (match != null) {
    const fragmentName = match[1]
    if (!REGEX_FRAGMENT_INLINE.test(fragmentName)) {
      fragments.push(fragmentName)
    }
    match = REGEX_FRAGMENT_SPREAD.exec(query)
  }
  return fragments
}

function extractFragmentName (definition) {
  const match = REGEX_FRAGMENT_NAME.exec(definition)
  return match && match[1]
}

function collectFragments (fragments, collection) {
  for (let i = 0; i < fragments.length; i++) {
    const name = fragments[i]
    const childFragments = FragmentMap[name].fragments
    if (collection.indexOf(name) === -1) {
      collection.push(name)
      childFragments.length && collectFragments(childFragments, collection)
    } else {
      break
    }
  }
  return collection
}

function reduceFragments (fragments) {
  return collectFragments(fragments, []).reduce((string, name) => {
    string += '\n' + FragmentMap[name].definition
    return string
  }, '')
}

function createOperation (type, opts) {
  let operationName, operationDefinition
  if (typeof opts === 'string') {
    operationDefinition = opts
  } else {
    const { name, variables, definition } = opts
    operationName = name || ''
    operationDefinition = name ? `${type} ${name} ` : ''
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
  }

  const fragments = extractFragmentSpreads(operationDefinition)
  const doc = `${operationDefinition}${reduceFragments(fragments)}`

  const operationObj = {
    name: operationName,
    definition: operationDefinition,
    fragments,
    document: doc,
    toString: () => doc,
    toJSON: () => doc
  }

  return operationObj
}

export function fragment (opts) {
  let fragmentName, fragmentDefinition
  if (typeof opts === 'string') {
    fragmentName = extractFragmentName(opts)
    fragmentDefinition = opts
  } else {
    const { name, on, definition } = opts
    fragmentName = name || (on && `Fragment${on}`) || extractFragmentName(definition)
    fragmentDefinition = on ? `fragment ${fragmentName} on ${on} ${definition}` : definition
  }

  const fragment = {
    name: fragmentName,
    definition: fragmentDefinition,
    fragments: extractFragmentSpreads(fragmentDefinition),
    toString: () => `...${fragmentName}`
  }

  FragmentMap[fragmentName] = fragment
  return fragment
}

export function query (opts) {
  return createOperation('query', opts)
}

export function mutation (opts) {
  return createOperation('mutation', opts)
}
