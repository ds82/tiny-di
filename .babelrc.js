module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 8,
          browsers: ['last 4 versions', 'safari >= 7']
        }
      }
    ]
  ],
  env: {
    production: {
      presets: ['minify'],
      retainLines: false
    }
  },
  plugins: [
    // ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-react-constant-elements',
    '@babel/plugin-proposal-function-bind'
  ]
  // ignore: ['/node_modules/(?!__mocks__|__tests__)'],
  // retainLines: true
};
