/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: gulp 默认配置
 */
'use strict';


const gulp = require('gulp'),
server     = require('gulp-express');

// 监听文件变化任务
gulp.task("watch", function(){
    gulp.watch(['app/**/*.js', 'app/**/*.service.js', 'setting/*.js'], server.notify)
    .on('error', err => {
        console.log('app router gulp', err)
        gutil.log('app Error!', err.message);
        this.end();
    });
})

gulp.task('server', () => {
	console.log('---> 开启服务')
    // 启动express服务器
    server.run(['index.js']);
    
	//  监听文件，改变时重启服务器
    gulp.watch(['app/**/*.js', 'setting/*.js' ], [server.run])
})

gulp.task('default', ['server', 'watch']);