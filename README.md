### 学习笔记
1. webpack默认可以处理json和js文件，所以无需配置相关loader，除此之外，需要配置对应解析相关文件的loader
2. webpack引入相关模块时，json和js文件不需要写后缀名，其他则需要正常写
3. 以entry入口文件为准，每个文件都是一个bundle
4. chunk可以分为两种,initial(入口起点指定的所有模块及其依赖项)和non-initial(异步加载模块),打包以后initial模块名和之前一样，non-initial为id，可以在import时通过传入/* webpackChunkName: "app" */，去自定义这些异步加载的模块
5. process.cwd是脚本运行的根目录，process.resolve不能拼接绝对路径，path.join可以拼接绝对和相对路径
console.log('process.cwd===', process.cwd())
console.log('process.resolve===', path.resolve(__dirname, '/dist'))
console.log('process.join===', path.join(__dirname, '/dist'))