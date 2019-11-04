const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const config = {
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  externals: {
    jquery: 'jQuery',
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
}

module.exports = config
