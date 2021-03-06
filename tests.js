/* eslint-env mocha */
const assert = require('assert')
const { fragment, query, mutation, reset } = require('./dist/graphql-builder.js')

describe('fragment', () => {
  beforeEach(reset)

  it('can build a basic fragment', () => {
    const frag = fragment({
      name: 'MyAwesomeFragment',
      on: 'Foo',
      definition: `{ id }`
    })

    const expected = `fragment MyAwesomeFragment on Foo { id }`

    assert.equal(frag.name, 'MyAwesomeFragment')
    assert.equal(frag.definition, expected)
  })

  it('can omit a name', () => {
    const frag = fragment({
      on: 'Foo',
      definition: `{ id }`
    })

    const expected = `fragment Foo on Foo { id }`

    assert.equal(frag.name, 'Foo')
    assert.equal(frag.definition, expected)
  })

  it('can omit a name and not override previously unnamed fragments', () => {
    const frag1 = fragment({
      on: 'Foo',
      definition: `{ id }`
    })

    const frag2 = fragment({
      on: 'Foo',
      definition: `{ id }`
    })

    const frag3 = fragment({
      on: 'Foo',
      definition: `{ id }`
    })

    const expected1 = `fragment Foo on Foo { id }`
    const expected2 = `fragment Foo1 on Foo { id }`
    const expected3 = `fragment Foo2 on Foo { id }`

    assert.equal(frag1.name, 'Foo')
    assert.equal(frag2.name, 'Foo1')
    assert.equal(frag3.name, 'Foo2')
    assert.equal(frag1.definition, expected1)
    assert.equal(frag2.definition, expected2)
    assert.equal(frag3.definition, expected3)
  })

  it('can just use a string definition directly', () => {
    const frag = fragment({
      definition: `fragment FragmentFoo on Foo { id }`
    })

    const expected = `fragment FragmentFoo on Foo { id }`
    assert.equal(frag.definition, expected)
  })

  it('can just use a string directly', () => {
    const frag = fragment(`fragment FragmentFoo on Foo { id }`)

    const expected = `fragment FragmentFoo on Foo { id }`
    assert.equal(frag.definition, expected)
  })

  it('collects nested fragments', () => {
    const frag1 = fragment({
      on: 'Foo',
      definition: `{ id }`
    })

    const frag2 = fragment({
      on: 'Bar',
      definition: `{ ${frag1} id }`
    })

    const expected = `fragment Bar on Bar { ...Foo id }`

    assert.equal(frag2.definition, expected)
    assert.equal(frag2.fragments.length, 1)
    assert.equal(frag2.fragments[0], frag1.name)
  })
})

describe('query', () => {
  beforeEach(reset)

  it('can build a basic query', () => {
    const q = query({
      name: 'MyAwesomeQuery',
      definition: `{ status }`
    })

    const expected = `query MyAwesomeQuery { status }`

    assert.equal(q.name, 'MyAwesomeQuery')
    assert.equal(q.definition, expected)
    assert.equal(q.document, expected)
  })

  it('can build a query with variables option', () => {
    const q = query({
      name: 'MyAwesomeQuery',
      variables: { id: 'ID!', publication: 'String = "NYTimes"' },
      definition: `{ post(id: $id, publication: $publication) { id name } }`
    })

    const expected = `query MyAwesomeQuery ($id: ID!, $publication: String = "NYTimes") { post(id: $id, publication: $publication) { id name } }`

    assert.equal(q.name, 'MyAwesomeQuery')
    assert.equal(q.definition, expected)
    assert.equal(q.document, expected)
  })

  it('can build a query with variables defined directly', () => {
    const q = query({
      definition: `query ($id: ID!, $publication: String = "NYTimes") { post(id: $id, publication: $publication) { id name } }`
    })

    const expected = `query ($id: ID!, $publication: String = "NYTimes") { post(id: $id, publication: $publication) { id name } }`

    assert.equal(q.definition, expected)
    assert.equal(q.document, expected)
  })

  it('can omit a name', () => {
    const q = query({
      definition: `{ status }`
    })

    const expected = `{ status }`

    assert.equal(q.name, '')
    assert.equal(q.definition, expected)
    assert.equal(q.document, expected)
  })

  it('can omit a name with variables', () => {
    const q = query({
      variables: { id: 'ID!', publication: 'String = "NYTimes"' },
      definition: `{ post(id: $id, publication: $publication) { id name } }`
    })

    const expected = `query ($id: ID!, $publication: String = "NYTimes") { post(id: $id, publication: $publication) { id name } }`

    assert.equal(q.name, '')
    assert.equal(q.definition, expected)
    assert.equal(q.document, expected)
  })

  it('can just use a strings directly', () => {
    const frag = fragment(`fragment FooFrag on Foo { foo }`)
    const q = query(`{ status ${frag} }`)

    const expectedDef = `{ status ...FooFrag }`
    const expectedDoc = `{ status ...FooFrag }
fragment FooFrag on Foo { foo }`

    assert.equal(q.definition, expectedDef)
    assert.equal(q.document, expectedDoc)
  })

  it('includes fragments in document output', () => {
    const frag = fragment({
      name: 'MyAwesomeFragment',
      on: 'Foo',
      definition: `{ id }`
    })

    const q = query({
      name: 'MyAwesomeQuery',
      definition: `{ status ${frag} }`
    })

    const expectedDef = `query MyAwesomeQuery { status ...MyAwesomeFragment }`
    const expectedDoc = `query MyAwesomeQuery { status ...MyAwesomeFragment }
fragment MyAwesomeFragment on Foo { id }`

    assert.equal(q.definition, expectedDef)
    assert.equal(q.document, expectedDoc)
  })

  it('includes deeply nested fragments recursively', () => {
    const frag1 = fragment({
      name: 'Frag1',
      on: 'Foo',
      definition: `{ foo }`
    })

    const frag2 = fragment({
      name: 'Frag2',
      on: 'Bar',
      definition: `{ ${frag1} bar }`
    })

    const frag3 = fragment({
      name: 'Frag3',
      on: 'Baz',
      definition: `{ ${frag2} baz }`
    })

    const frag4 = fragment({
      name: 'Frag4',
      on: 'Qux',
      definition: `{ qux }`
    })

    const frag5 = fragment({
      definition: `fragment Frag5 on Five { five }`
    })

    const q = query({
      name: 'ComplexQuery',
      definition: `{ status ${frag3} ${frag4} ${frag5} }`
    })

    const expectedDef = `query ComplexQuery { status ...Frag3 ...Frag4 ...Frag5 }`
    const expectedDoc = `query ComplexQuery { status ...Frag3 ...Frag4 ...Frag5 }
fragment Frag3 on Baz { ...Frag2 baz }
fragment Frag2 on Bar { ...Frag1 bar }
fragment Frag1 on Foo { foo }
fragment Frag4 on Qux { qux }
fragment Frag5 on Five { five }`

    assert.equal(q.definition, expectedDef)
    assert.equal(q.document, expectedDoc)
  })

  it('handles circular referenced fragments', () => {
    const frag = fragment({
      name: 'FragFoo',
      on: 'Foo',
      definition: `{ id ...FragFoo }`
    })

    const q = query({
      definition: `{ ${frag} }`
    })

    const expectedDef = `{ ...FragFoo }`
    const expectedDoc = `{ ...FragFoo }
fragment FragFoo on Foo { id ...FragFoo }`

    assert.equal(q.definition, expectedDef)
    assert.equal(q.document, expectedDoc)
  })

  it('dedupes fragments', () => {
    const frag1 = fragment({
      name: 'Frag1',
      on: 'Foo',
      definition: `{ foo }`
    })

    const frag2 = fragment({
      name: 'Frag2',
      on: 'Bar',
      definition: `{ ${frag1} bar }`
    })

    const frag3 = fragment({
      name: 'Frag3',
      on: 'Baz',
      definition: `{ ${frag1} baz }`
    })

    const q = query({
      name: 'ComplexQuery',
      definition: `{ status ${frag2} ${frag3} }`
    })

    const expectedDef = `query ComplexQuery { status ...Frag2 ...Frag3 }`
    const expectedDoc = `query ComplexQuery { status ...Frag2 ...Frag3 }
fragment Frag2 on Bar { ...Frag1 bar }
fragment Frag1 on Foo { foo }
fragment Frag3 on Baz { ...Frag1 baz }`

    assert.equal(q.definition, expectedDef)
    assert.equal(q.document, expectedDoc)
  })

  it('ignores inline fragments', () => {
    const frag1 = fragment({
      name: 'Frag1',
      on: 'Foo',
      definition: `{ foo }`
    })

    const q = query({
      name: 'ComplexQuery',
      definition: `{ status ${frag1} ...on Bar { bar } ... on Baz { baz } }`
    })

    const expectedDef = `query ComplexQuery { status ...Frag1 ...on Bar { bar } ... on Baz { baz } }`
    const expectedDoc = `query ComplexQuery { status ...Frag1 ...on Bar { bar } ... on Baz { baz } }
fragment Frag1 on Foo { foo }`

    assert.equal(q.definition, expectedDef)
    assert.equal(q.document, expectedDoc)
  })

  it('outputs toString/toJSON equal to the document', () => {
    const frag = fragment({
      name: 'MyAwesomeFragment',
      on: 'Foo',
      definition: `{ id }`
    })

    const q = query({
      name: 'MyAwesomeQuery',
      definition: `{ status ${frag} }`
    })

    const expected = `query MyAwesomeQuery { status ...MyAwesomeFragment }
fragment MyAwesomeFragment on Foo { id }`

    assert.equal(q.document, expected)
    assert.equal(q.toString(), expected)
    assert.equal(q.toJSON(), expected)
    assert.equal(JSON.stringify({ query: q }), `{"query":"${expected}"}`.replace(/\n/g, '\\n'))
  })

  it('can extend definitions', () => {
    const q = query({
      definition: `query MyAwesomeQuery { status }`
    })

    const q2 = Object.assign({}, q, {
      definition: q.definition.replace('status', 'uptime')
    })

    assert.equal(q2.toString(), `query MyAwesomeQuery { uptime }`)
  })
})

describe('mutation', () => {
  beforeEach(reset)

  it('can omit a name with variables', () => {
    const m = mutation({
      variables: { postId: 'ID!', tagIds: '[ID!]!' },
      definition: `{ setTagsOfPost(input: {postId: $postId, tagIds: $tagIds}) { post { id } tags { id } } }`
    })

    const expected = `mutation ($postId: ID!, $tagIds: [ID!]!) { setTagsOfPost(input: {postId: $postId, tagIds: $tagIds}) { post { id } tags { id } } }`

    assert.equal(m.name, '')
    assert.equal(m.definition, expected)
    assert.equal(m.document, expected)
  })
})
