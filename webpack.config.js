const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env = {}, argv = {}) => {
  const isMfe = env.mfe === true || env.mfe === "true";
  const mode = argv.mode || "development";

  return {
    entry: "./src/sage-org-synctime-dashboard.tsx",

    mode,

    devtool: mode === "development" ? "source-map" : false,

    output: {
      filename: "sage-org-synctime-dashboard.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      clean: true,

      /*
       * IMPORTANT:
       * - standalone mode: normal browser bundle, webpack injects script
       * - mfe mode: SystemJS bundle for Admin Portal / single-spa
       */
      ...(isMfe
        ? {
            libraryTarget: "system"
          }
        : {})
    },

    devServer: {
      port: 8500,
      historyApiFallback: true,
      hot: true,
      static: false,
      client: {
        overlay: true
      },
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
      new HtmlWebpackPlugin({
        template: "./src/index.ejs",

        /*
         * standalone: webpack injects the JS bundle normally.
         * mfe: index.ejs loads bundle through SystemJS.
         */
        inject: isMfe ? false : "body",

        templateParameters: {
          isMfe,
          mfeName: "@sage-org/synctime-dashboard",
          bundleName: "sage-org-synctime-dashboard.js"
        }
      })
    ]
  };
};