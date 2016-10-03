const path = require('path');
const webpack = require('webpack');
const package = require('./package.json');
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");

const cssConfig = {
  query: {
    modules: true,
    localIdentName: '[local]-[hash:base64:10]',
    camelCase: true
  }
}

module.exports = {
  type: 'react-app',

  webpack: {
    extra: {
      resolve: {
        root: [path.resolve('./src')],
        extensions: ['', '.js', '.scss']
      },
      output: {
        publicPath: ''
      },
      // plugins: [
      //   new webpack.ResolverPlugin(new DirectoryNamedWebpackPlugin())
      // ],
      target: 'electron-renderer'
    },
    html: {
      template: path.resolve('./src/index.html'),
      title: package.name
    },
    loaders: {
      'css': cssConfig,
      'sass-css': cssConfig
    }
  },

  babel: {
    stage: 0
  }
}
