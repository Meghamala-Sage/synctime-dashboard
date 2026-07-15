const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/sage-org-synctime-dashboard.tsx",
    mode: "development",
  output: {
    filename: "sage-org-synctime-dashboard.js",
    libraryTarget: "system",
    publicPath: "auto",
    clean: true
  },
  resolve: { extensions: [".ts", ".tsx", ".js"] },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] }
    ]
  },
  devtool: "source-map",
  devServer: {
    historyApiFallback: true,
    headers: { "Access-Control-Allow-Origin": "*" }
  },
  plugins: [new HtmlWebpackPlugin({ template: "src/index.ejs", inject: false })]
};