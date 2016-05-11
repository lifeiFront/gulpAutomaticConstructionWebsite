# gulpAutomaticConstructionWebsite
gulp 自动化构建web站点实例详解
<br>
gulpfile.js文件中有详细的注释
<br>
功能：自动化压缩js、css代码，添加md5后缀，替换jsp、html中的对应引用路径实例。
<br>
要求有一定的nodejs、gulp基础。<br>
使用方法：<br>
1、搭建nodejs环境，安装gulp模块。<br>
2、在根目录下（gulpfile.js文件所在的目录），执行npm install命令，安装依赖的模块。<br>
3、运行gulp rev 执行rev任务，完成自动化压缩替换工作。<br>
也可以执行gulp,执行default任务，监听js、css文件的变化，有文件变动会执行rev任务，完成相关工作。<br>

注：此实例仅作为入门级参考示例，可修改对应的js查看具体的结果，熟悉工具的工作流程。<br>
对实例中用到的各种模块，自查资料，了解其详细用法。<br>
gulp常用插件：http://www.mamicode.com/info-detail-517085.html
