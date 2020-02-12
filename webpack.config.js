const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const packageJSON = JSON.parse(JSON.stringify(require('./package.json')))
let dep = {}
for (let s in packageJSON.dependencies) {
  dep[s] = s
}

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    library: 'gulpJsart',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib')
  },
  externals: dep,
  target: 'node',
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  node: {
    fs: 'empty',
    path: 'empty',
    __dirname: false,
    __filename: false
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: 'lib'
    })
  ]
}
