const path = require('path');
const webpack = require('webpack');
const htmlInjectPlugin = require('html-webpack-plugin'); // html注入js插件
const handleFileUrl = (src) => {
    return path.resolve(__dirname, src)
}

module.exports = {
    mode: 'development',
    entry: {
        // 把无需修改的文件打包到一个文件中，优化每次打包的速度，可以让文件更好的缓存起来
        common: 'common/index.js',
        index1: {
            dependOn: 'common',
            import: './src/js/index1.js',
        },
        index2: {
            dependOn: 'common',
            import: './src/js/index2.js',
        }
    },
    output: {
        path: path.join(__dirname, 'dist'),
        // 入口文件和其依赖模块
        filename: '[name].js',
        // 异步引入的文件和其依赖模块
        chunkFilename: '[name].js'
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
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
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
                outputPath: 'img',
            }
        }]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new htmlInjectPlugin({
            filename: 'index.html',
            inject: "body",
            template: handleFileUrl('./src/html/index.html'),
            chunks: ['common']
        }),
        new htmlInjectPlugin({
            filename: 'index1.html',
            inject: "body",
            template: handleFileUrl('./src/html/index1.html'),
            chunks: ['common', 'index1']
        }),
        new htmlInjectPlugin({
            filename: 'index2.html',
            inject: "body",
            template: handleFileUrl('./src/html/index2.html'),
            chunks: ['common', 'index2']
        })
    ],
    devServer: {
        compress: true,
        port: 9999,
        open: true,
        // 设置服务启动的目录
        static: './src'
    }
}
