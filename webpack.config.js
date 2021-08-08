const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// new ExtractTextPlugin("style.css") //提取出来的样式放在style.css文件中
module.exports = {
    mode: 'development',
    entry: {
        rootName: path.join(__dirname, '/src/main.tsx')
    },
    devServer: {
        contentBase: "./dist",
        port: 3000,
        open: false,
        compress: true, 
        disableHostCheck: true,
        index: 'main.html'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.tsx?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'ts-loader'
                },
            },{
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.ejs$/,
                use: [
                  {
                    loader: 'ejs-loader',
                    options: {
                      esModule: false,
                      variable: 'data',
                    },
                  },
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: "defaults"
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                // use: [
                //     process.env.NODE_ENV !== 'production' ?
                //     'style-loader' :
                //     MiniCssExtractPlugin.loader,
                //     'css-loader',
                //     'sass-loader',
                // ],
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
        ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'], 
      alias: {
        '@my': path.join(__dirname, '/src'),
        '@src': path.join(__dirname, '/src')
    },
    modules: ['src', 'node_modules']
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'main.html',
            title: 'roots',
            template: path.resolve(__dirname, './src/assets/main.html')
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.scss$/g,
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
              preset: ['default', { discardComments: { removeAll: true } }]
            },
            canPrint: true
        }),
    ],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[chunkhash].js'
    }
}