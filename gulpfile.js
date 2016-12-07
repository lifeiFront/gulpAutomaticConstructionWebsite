var gulp = require('gulp'),
    runSequence = require('run-sequence'),//保证任务按照一定的顺序执行模块
    del = require('del'),//删除文件及文件夹模块
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(); //获取package.json中已有安装的gulp模块json对象，方便引用


gulp.task('css', function() {
    return gulp.src('css/*.css')
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions'], //自动补全样式前缀，针对最新的两个浏览器版本
            cascade: false
        }))
        .pipe(plugins.minifyCss())
        .pipe(plugins.rev()) //对文件流进行处理，更改文件名，添加md5后缀
        .pipe(gulp.dest('dist/css')) //写入到此路径下
        .pipe(plugins.rev.manifest()) //处理流，生成原始文件名：添加后缀后的文件名对应关系的json文件
        .pipe(gulp.dest('rev/css')); //将json文件保存到此路径下
});

gulp.task('js', function() {
    return gulp.src('js/*.js')
        .pipe(plugins.uglify())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('rev/js'));
});

gulp.task('del', function() {//先删除文件
    return del(['dist']);
});

gulp.task('default',function(){//js、样式文件发生变化是，自动执行rev任务重新构建工程
    gulp.watch('js/**/*.js', ['rev']);
    gulp.watch('css/**/*.css', ['rev']);
    // gulp.watch('js/**/*.js', function(event) {//也可通过这种方式针对性的压缩改变的js、css
    //     console.log(event.type); //变化类型 added为新增,deleted为删除，changed为改变 
    //     console.log(event.path); //变化的文件的路径
    // });
});
//执行rev任务，调试看下，生成的manifest  json文件中有引入的js,css
//文件名与根据内容计算出来的签名后缀的对应关系（{"normalize.css": "normalize-0f0d0833f8.css"}），然后替换对应页面中的路径引用  .html文件与.jsp文件均可
//如果html或者jsp中有字符与样式引入的字符相同也会被替换如：
//<link rel="stylesheet" href="css/normalize.css" /> 
//body体重如果含有"css/normalize.css"字符内容也会被替换，项目中要避免
//app.js可以被替换 app-a8a87ad36b.js也会被替换，app-后面的字符必须是合法的md5,app-222.js这种随意写的名字不会被替换

gulp.task('rev', function() {
     
    //del 与['js', 'css']顺序执行， ['js', 'css']中的异步执行
    runSequence('del', ['js', 'css'],
        function() {
            return gulp.src(['rev/**/*.json', 'html/*.jsp', 'html/*.html']) //文件的替换依赖于rev/**/*.json次路径下的json文件中的对应关系
                .pipe(plugins.revCollector({
                    replaceReved: true,
                    dirReplacements: {
                        'css': '/dist/css', //前面的css是文件中的原始路径，后面的是替换后的路径。注释掉后，直接替换文件名，路径还是页面中原始的路径
                        'js': '/dist/js',
                        'cdn/': function(manifest_value) {
                            return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
                        }
                    }
                }))
                .pipe(plugins.htmlmin({
                    empty: true,
                    spare: true
                }))
                .pipe(gulp.dest('dist'));
        });
});
// gulp.task('rev', ['js', 'css'], function() {
//     return gulp.src(['rev/**/*.json', 'html/*.jsp', 'html/*.html']) //文件的替换依赖于rev/**/*.json次路径下的json文件中的对应关系
//         .pipe(plugins.revCollector({
//             replaceReved: true,
//             dirReplacements: {
//                 'css': '/dist/css', //前面的css是文件中的原始路径，后面的是替换后的路径。注释掉后，直接替换文件名，路径还是页面中原始的路径
//                 'js': '/dist/js',
//                 'cdn/': function(manifest_value) {
//                     return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
//                 }
//             }
//         }))
//         .pipe(plugins.htmlmin({
//             empty: true,
//             spare: true
//         }))
//         .pipe(gulp.dest('dist'));
// });

// 推荐使用gulp-rev + gulp-rev-collector是比较方便的方法，结果如下:
//http://www.cnblogs.com/givebest/p/4707432.html
// "/css/style.css" => "/dist/css/style-1d87bebe.css"    
// "/js/script1.js" => "/dist/script1-61e0be79.js"    
// "cdn/image.gif"  => "//cdn8.example.dot/img/image-35c3af8134.gif"
// 但是由于公司发布系统限制，如果用上面方法实现，每次更新都会积压过多过期无用的文件，我们预期效果是:

// "/css/style.css" => "/dist/css/style.css?v=1d87bebe"
// "/js/script1.js" => "/dist/script1.js?v=61e0be79"
// "cdn/image.gif"  => "//cdn8.example.dot/img/image.gif?v=35c3af8134"
// 怎么破?改上面两个Gulp插件是最高效的方法了。

// 安装Gulp
// npm install --save-dev gulp

// 分别安装gulp-rev、gulp-rev-collerctor
// npm install --save-dev gulp-rev
// npm install --save-dev gulp-rev-collector

// 打开node_modules\gulp-rev\index.js

// 第133行 manifest[originalFile] = revisionedFile;
// 更新为: manifest[originalFile] = originalFile + '?v=' + file.revHash;

// 打开node_modules\gulp-rev\node_modules\rev-path\index.js

// 10行 return filename + '-' + hash + ext;
// 更新为: return filename + ext;

// 打开node_modules\gulp-rev-collector\index.js

// 31行 if ( path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' ) !== path.basename(key) ) {
// 更新为: if ( path.basename(json[key]).split('?')[0] !== path.basename(key) ) {
