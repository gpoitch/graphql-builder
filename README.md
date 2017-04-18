# GraphQL Builder [![Build Status](https://travis-ci.org/gdub22/graphql-builder.svg?branch=master)](https://travis-ci.org/gdub22/graphql-builder)

A simple string utility to build GraphQL queries.

## Key Features:
- Automatically interpolates and includes fragment definitions into a query
- Define fragments/queries/mutations as objects so you can extend them

## Examples:

<details>
<summary>Strings with fragment interpolation</summary>

```js
import { fragment, query } from 'graphql-builder'

const FragmentAuthor = fragment(`
  fragment FragmentAuthor on Author { 
    id
    name
  }
`)

const PostQuery = query(`
  query (id: Int!) {
    post (id: $id) {
      id
      title
      ${FragmentAuthor}
    }
  }
`)

console.log(PostQuery)
/*
query ($id: Int!) {
  post (id: $id) {
    id
    title
    ...FragmentAuthor
  }
}

fragment FragmentAuthor on Author {
  id
  name
}
*/
```
</details>

<details>
<summary>Utilizing all options</summary>

```js
import { fragment, query } from 'graphql-builder'

const FragmentAuthor = fragment({
  name: 'FragmentAuthor', // name is optional.  If omitted, will be 'Fragment'+on
  on: 'Author',
  definition: `{ 
    id
    name
  }`
})

const PostQuery = query({
  name: 'PostQuery' // name is optional, unless you have mutliple operations in your request.
  variables: { // variables are optional. Useful for extending queries.
    id: 'Int!'
  },
  definition: `{
    post (id: $id) {
      id
      title
      ${FragmentAuthor}
    }
  }`
})

console.log(PostQuery)
/*
query PostQuery ($id: Int!) {
  post (id: $id) {
    id
    title
    ...FragmentAuthor
  }
}

fragment FragmentAuthor on Author {
  id
  name
}
*/
```
</details>
