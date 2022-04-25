const path = require('path');
const webpack = require('webpack');
const htmlInjectPlugin = require('html-webpack-plugin'); // html注入js插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 把css文件单独分离出来
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); //清除之前打包的文件
const glob = require('glob');
const handleFileUrl = (src) => {
    return path.join(__dirname, src)
}

const setMPA = () => {
    const entry = {};
    const htmlWebpackPlugins = [];
    const entryFiles = glob.sync(handleFileUrl('./src/js/*.js'));
    console.log('entryFiles==', entryFiles);
    Object.keys(entryFiles)
        .map((index) => {
            const entryFile = entryFiles[index]; // 获取入口文件的路径
            const match = entryFile.match(/src\/js\/(.*)\.js/);
            const pageName = match && match[1]; // 获取入口文件的名称

            entry[pageName] = entryFile;
            // 循环动态打包文件
            htmlWebpackPlugins.push(
                new htmlInjectPlugin({
                    template: handleFileUrl(`./src/html/${pageName}.html`),
                    filename: handleFileUrl(`./dist/${pageName}.html`),
                    chunks: ['common', pageName],
                    inject: "body",
                    minify: {
                        html5: true,
                        collapseWhitespace: true,
                        preserveLineBreaks: false,
                        minifyCSS: true,
                        minifyJS: true,
                        removeComments: false
                    }
                })
            );
        });
    console.log('entry===', entry)
    console.log('htmlWebpackPlugins===', htmlWebpackPlugins)

    return {
        entry,
        htmlWebpackPlugins
    }
}
const { entry, htmlWebpackPlugins } = setMPA();
module.exports = (env, argv) => ({
    mode: 'development',
    entry: {
        // 把无需修改的文件打包到一个文件中，优化每次打包的速度，可以让文件更好的缓存起来
        common: 'common/index.js',
        ...entry
    },
    output: {
        path: path.join(__dirname, 'dist'),
        // 入口文件和其依赖模块
        filename: './js/[name].[contenthash:8].js',
        // 异步引入的文件和其依赖模块
        chunkFilename: './js/[name].[contenthash:8].js',
        clean: true,
        publicPath: ''
        // cdn
        // publicPath: 'https://cdn.com'
    },
    target: 'web',
    resolve: {
        // 模块引入别名设置
        alias: {
            common: path.resolve(__dirname, 'src/common'),
            css: path.resolve(__dirname, 'src/css'),
            entry: path.resolve(__dirname, 'src/entry'),
            html_template: path.resolve(__dirname, 'src/html_template'),
            json: path.resolve(__dirname, 'src/json'),
            txt: path.resolve(__dirname, 'src/txt'),
            js: path.resolve(__dirname, 'src/js'),
            images: path.resolve(__dirname, 'src/images')
        },
    },
    // 排除不需要的监听，节省性能
    watchOptions: {
        ignored: /node_modules/,
    },
    module: {
        rules: [
            {
                test: /\.txt$/, use: 'raw-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: argv.mode !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                    }, {
                        loader: 'css-loader'
                    }, {
                        loader: 'postcss-loader'
                    }
                ]
            },
            {
                test:/\.(jpg|png|gif)$/,
                type: 'asset/resource',
                generator:{ 
                  filename:'images/[name].[hash:8][ext]',
                },
              },
              {
                test:/\.html$/,
                loader:'html-loader',
              },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(), // 清理之前的打包文件,
        ...htmlWebpackPlugins,
        new MiniCssExtractPlugin({
            // 分离css
            filename: "./css/[name].[chunkhash:8].css",
            chunkFilename: "./css/[name].[chunkhash:8].css",
        }),
        new OptimizeCssAssetsWebpackPlugin() // 压缩css
    ],
    devServer: {
        compress: true,
        port: 9999,
        open: true
    }
})