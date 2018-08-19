const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {

  mode: 'development', 

  entry: './scss/main.scss',

  output: {
    path: path.resolve(__dirname, 'css/')
  },


  devServer: {
    contentBase: path.resolve( __dirname ),
    publicPath: '/'
  },


  
  watchOptions: {
    ignored: ['node_modules']
  } ,


  
  module: {

    rules: [

      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader' ,
          'postcss-loader' ,
          'sass-loader' ,
        ],
      } ,
   
    ]

  },


  optimization: {
    splitChunks: {
        cacheGroups: {
            css: {
                test: /\.(css|sass|scss)$/,
                name: "commons",
                chunks: "all",
                minChunks: 2,
            }
        }
    }
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
  ],




};
//Implement accessibility features in the site HTML
//Add a ServiceWorker script to cache requests to all of the site’s