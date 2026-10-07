const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env = {}, argv = {}) => {
  const isMfe = env.mfe === true || env.mfe === "true";
  const mode = argv.mode || "development";

  return {
    entry: isMfe ? "./src/portal-entry.tsx" : "./src/sage-org-synctime-dashboard.tsx",
    mode,
    devtool: mode === "development" ? "source-map" : false,

    output: {
      filename: "sage-org-synctime-dashboard.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      clean: true,
      ...(isMfe ? { library: { name: "SyncTimeDashboard", type: "window" } } : {})
    },

    devServer: {
      port: 8500,
      historyApiFallback: true,
      hot: true,
      client: { overlay: true },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"]
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
    },

    plugins: [
      ...(!isMfe ? [new webpack.DefinePlugin({
        "window.__SYNC_TIME_API_BASE_URL__": JSON.stringify(mode === "development" ? "http://localhost:3001" : "")
      })] : []),
      ...(!isMfe ? [new HtmlWebpackPlugin({
        template: "./src/index.ejs",
        inject: isMfe ? false : "body",
        templateParameters: {
          isMfe,
          mfeName: "@sage-org/synctime-dashboard",
          bundleName: "sage-org-synctime-dashboard.js"
        }
      })] : [])
    ]
  };
};
