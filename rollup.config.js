import babel from 'rollup-plugin-babel'

export default {
  entry: 'index.js',
  targets: [{
    dest: 'dist/graphql-builder.js',
    format: 'umd',
    moduleName: 'GraphQLBuilder'
  }, {
    dest: 'dist/graphql-builder.es.js',
    format: 'es'
  }],
  plugins: [
    babel({
      presets: [
        ['env', {
          targets: {
            browsers: ['last 2 versions', 'IE >= 10'],
            node: [4]
          },
          modules: false
        }]
      ]
    })
  ]
}
