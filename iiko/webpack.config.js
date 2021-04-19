const path = require('path');

module.exports = {
  mode: 'production',
  devtool: false,
  context: path.resolve(__dirname, 'src'),
  entry: {
    rstore: ['@babel/polyfill', './plugin/rstore.js']
  },
  output: {
    path: path.resolve(__dirname, './public/dist'),
    filename: 'rstore.min.js',
    libraryTarget: 'var',
    library: "rstore"
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
