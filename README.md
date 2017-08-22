# GraphQL Builder [![Build Status](https://travis-ci.org/gpoitch/graphql-builder.svg?branch=master)](https://travis-ci.org/gpoitch/graphql-builder)

A simple string utility to build GraphQL queries.

## 🔑 Features:
- Automatically interpolates and includes fragment definitions into queries
- Define fragments/queries/mutations as objects so you can extend them

## Examples:

<details>
<summary>Strings with fragment interpolation</summary>

```js
import { fragment, query, mutation } from 'graphql-builder'

const PostAuthorFragment = fragment(`
  fragment PostAuthor on User { 
    id
    name
  }
`)

const PostQuery = query(`
  query ($id: Int!) {
    post (id: $id) {
      id
      title
      author {
        ${PostAuthorFragment}
      }
    }
  }
`)

console.log(PostQuery)
/*
query ($id: Int!) {
  post (id: $id) {
    id
    title
    author {
      ...PostAuthor
    }
  }
}

fragment PostAuthor on User {
  id
  name
}
*/
```
</details>

<details>
<summary>Building with all options</summary>

```js
import { fragment, query, mutation } from 'graphql-builder'

const PostAuthorFragment = fragment({
  name: 'PostAuthor', // name is optional.  If omitted, will be `on`
  on: 'User',
  definition: `{ 
    id
    name
  }`
})

const PostQuery = query({
  name: 'PostQuery' // name is optional, unless you have mutliple operations in your request.
  variables: {      // variables are optional. Useful for extending queries.
    id: 'Int!'
  },
  definition: `{
    post (id: $id) {
      id
      title
      author {
        ${PostAuthorFragment}
      }
    }
  }`
})

console.log(PostQuery)
/*
query PostQuery ($id: Int!) {
  post (id: $id) {
    id
    title
    author {
      ...PostAuthor
    }
  }
}

fragment PostAuthor on User {
  id
  name
}
*/
```
</details>
