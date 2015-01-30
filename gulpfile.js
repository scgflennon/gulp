'use strict';
var gulp = require('gulp');
var runSequence = require('run-sequence'); //タスクを並列/直列処理する
var compass = require('gulp-compass'); //Compass
var plumber = require('gulp-plumber'); //デスクトップ通知
var notify = require("gulp-notify"); //デスクトップ通知
var size = require('gulp-size'); // 制作物のサイズ確認
var imagemin = require('gulp-imagemin'); // 画像圧縮
var pngquant = require('imagemin-pngquant'); // PNG画像圧縮
var gzip = require("gulp-gzip"); // gizp圧縮
var changed  = require('gulp-changed'); // 変更箇所のみ
var frontnote = require("gulp-frontnote"); // テンプレートエンジン

// Compassの設定 ⇒ CSS生成 ⇒ スタイルガイド生成 ⇒ gizp圧縮
gulp.task('compass', function(){
	var s = size();
	gulp.src('scss/**/*.scss')
	.pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	}))
	.pipe(frontnote({
		css: '../css/**.css',
		out: './StyleGuide'
	}))
	.pipe(compass({
    	config_file: 'config.rb',
    	comments: false,
    	css: 'css/',
    	sass: 'scss/'
	}))
	.pipe(gzip())
	.pipe(gulp.dest('css'))
	.pipe(s)
	.pipe(notify({
		onLast: true,
		message: function () {
			return 'Total CSS size (gziped)' + s.prettySize;
		}
	}));
});

gulp.task('imagemin', function () {
	var s = size();
	return gulp.src('images/*.+(jpg|jpeg|png|gif|svg)')
	.pipe(changed('images/*.+(jpg|jpeg|png|gif|svg)'))
	.pipe(imagemin({
		optimizationLevel: 7,
		progressive: true,
	}))
	.pipe(gulp.dest('images'))
	.pipe(s)
	.pipe(notify({
		onLast: true,
		message: function () {
			return 'Total imagemin size' + s.prettySize;
		}
	}));
});

gulp.task('watch',function(){
	gulp.watch(["js/**/*.js","!js/min/**/*.js"],["js"]);
	gulp.watch(['scss/**/*.scss'],['compass']);
});

gulp.task('default', function(callback) {
	return runSequence(
	'compass',
	['watch'],
	callback
	);
});

gulp.task('prod', function(callback){
	return runSequence(
	['compass'],
	['imagemin'],
	callback
	);
});