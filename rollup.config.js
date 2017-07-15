import babel from 'rollup-plugin-babel'

export default {
  input: 'index.js',
  output: [{
    file: 'dist/graphql-builder.js',
    format: 'umd',
    name: 'GraphQLBuilder'
  }, {
    file: 'dist/graphql-builder.es.js',
    format: 'es'
  }],
  plugins: [
    babel({
      presets: [
        ['env', {
          targets: {
            browsers: ['last 2 versions', 'IE >= 10'],
            node: [6]
          },
          modules: false
        }]
      ]
    })
  ]
}
