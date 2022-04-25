const path = require('path');
const webpack = require('webpack');
const htmlInjectPlugin = require('html-webpack-plugin'); // html注入js插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 把css文件单独分离出来
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); //清除之前打包的文件
const glob = require('glob');
console.log('isPro===', process.env.NODE_ENV)
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
                    title: pageName,
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
        path: path.join(__dirname, 'dist/js'),
        // 入口文件和其依赖模块
        filename: '[name].[contenthash:8].js',
        // 异步引入的文件和其依赖模块
        chunkFilename: '[name].[contenthash:8].js',
        clean: true,
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
            js: path.resolve(__dirname, 'src/js')
        },
    },
    // 排除不需要的监听，节省性能
    watchOptions: {
        ignored: /node_modules/,
    },
    module: {
        rules: [{
            test: /\.txt$/, use: 'raw-loader'
        }, {
            test: /\.css$/, use: [
                {
                    loader: argv.mode !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader'
                }
            ]
        }, {
            test: /\.(png|jpg|gif)$/i,
            loader: 'url-loader',
            options: {
                // 图片大小小于8kb，就会被base64处理，优点：减少请求数量（减轻服务器压力），缺点：图片体积会更大（文件请求速度更慢）
                // base64在客户端本地解码所以会减少服务器压力，如果图片过大还采用base64编码会导致cpu调用率上升，网页加载时变卡
                limit: 8000,
                // 给图片重命名，[hash:10]：取图片的hash的前10位，[ext]：取文件原来扩展名
                name: '[hash:10].[ext]',
                esModule: false,
                outputPath: '../images',
            }
        }]
    },
    plugins: [
        new CleanWebpackPlugin(), // 清理之前的打包文件,
        ...htmlWebpackPlugins,
        new MiniCssExtractPlugin({
            // 分离css
            filename: "../css/[name].[chunkhash:8].css",
            chunkFilename: "../css/[name].[chunkhash:8].css",
        }),
        new OptimizeCssAssetsWebpackPlugin()
    ],
    devServer: {
        compress: true,
        port: 9999,
        open: true,
        static: './src'
    }
})