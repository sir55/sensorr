const path = require('path')
const favicon = require('favicons-webpack-plugin')

module.exports = {
  entry: ['@babel/polyfill', 'reset-css', path.resolve(__dirname, 'src', 'index.js')],
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: ['babel-loader'],
      },
      {
        test: /\.(jpe?g|png)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'assets/images/',
          },
        }],
      },
      {
        test: /\.(css)?$/,
        use: ['style-loader','css-loader'],
      },
      {
        test: /\.(eot|ttf|svg|woff2?)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'assets/fonts/',
          },
        }],
      }
    ],
  },
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
    alias: {
      shared: path.join(__dirname, 'shared'),
    }
  },
  plugins: [
    new favicon({
      logo: path.join(__dirname, 'src', 'ressources', 'favicon.png'),
      prefix: 'assets/favicon/'
    }),
  ],
}
