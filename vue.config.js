module.exports = {
  indexPath: './examples/index.html',
  devServer: {
    port: 9180,
    disableHostCheck: true,
    historyApiFallback: true,
  },
  crossorigin: 'anonymous',
  configureWebpack: {
    entry: "./examples/main.js",
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      },
    },

  }
}