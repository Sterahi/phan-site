const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const VersionFile = require('webpack-version-file')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const webpack = require('webpack')

const srcDir = path.resolve(__dirname, 'client/src')
const buildPath = path.resolve(__dirname, 'client/dist')

const webpackConfig = {
    entry: {
        app: ['@babel/polyfill', `${srcDir}/index.js`],
    },
    output: {
        filename: '[name].bundle.js',
        path: buildPath
    },
    plugins: [
        new CleanWebpackPlugin([buildPath]),
        new HtmlWebpackPlugin({
            template: `${srcDir}/index.html`,
            filename: 'index.html',
            title: 'PhanSite',
            inject: 'body'
        }),
    ],

    devServer: {
        contentBase: path.resolve(__dirname, `${buildPath}`),
        port: 3000,
        hot: true,
        proxy: {
            '/api': {
                target: {
                    host: '0.0.0.0',
                    protocol: 'http:',
                    port: 8888,
                },
                pathRewrite: {
                    '^/api': '/api',
                },
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules|bower_components/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                    },
                },
            }, {
                test: /\.(css|scss)$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                sideEffects: true,
            }, {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader'],
            }, {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader'],
            },
        ],
    },
}

module.exports = (env, argv) => {
    if(argv.mode === 'development') {
        webpackConfig.devtool = "inline-source-map"

        webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
    }

    if(argv.mode === 'production') {
        webpackConfig.output.filename = '[name].[chunkhash].js'
        webpackConfig.devtool = 'source-map'

        webpack.Config.plugins.push(
            new UglifyJsPlugin({
                sourceMap: true,
            }),
            new VersionFile({
                output: `${buildPath}/version.txt`,
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
                generateStatsFile: true,
                reportFilename: "../bundle-report/bundle-report.html",
                statsFilename: '../bundle-report/bundle-stats.json'
            })
        )
    }
    return webpackConfig
}
