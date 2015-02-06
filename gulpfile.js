var gulp = require('gulp');
var runSequence = require('run-sequence'); //タスクを並列/直列処理する
var compass = require('gulp-compass'); //Compass
var plumber = require('gulp-plumber'); //デスクトップ通知
var notify = require("gulp-notify"); //デスクトップ通知
var size = require('gulp-size'); // 制作物のサイズ確認
var imagemin = require('gulp-imagemin'); // 画像圧縮
var pngquant = require('imagemin-pngquant'); // PNG画像圧縮
var uglify = require('gulp-uglify'); // js圧縮
var gzip = require('gulp-gzip');//gizp圧縮
var changed  = require('gulp-changed'); // 変更箇所のみ
var frontnote = require("gulp-frontnote"); // テンプレートエンジン

// Compassの設定 ⇒ CSS生成 ⇒ スタイルガイド生成 ⇒ gizp圧縮
gulp.task('compass', function(){
	var s = size();
	gulp.src('scss/**/*.scss')
	.pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	}))
	.pipe(compass({
    	config_file: 'config.rb',
    	comments: false,
    	css: 'css/',
    	sass: 'scss/'
	}));
});

//CSSのgzip圧縮
gulp.task('cssgzip',function(){
	var s = size();
	gulp.src('css/**/*.css')
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

//jsのgzip圧縮
gulp.task('jsgzip',function(){
	var s = size();
	gulp.src('js/min/**/*.js')
	.pipe(gzip())
	.pipe(gulp.dest('js/min/'))
	.pipe(s)
	.pipe(notify({
		onLast: true,
		message: function () {
			return 'Total CSS size (gziped)' + s.prettySize;
		}
	}));
});

//js圧縮
gulp.task('js', function() {
  gulp.src(['js/**/*.js','!js/min/**/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('js/min'));
});

//スタイルシート生成
gulp.task('styleguide', function(){
	gulp.src('scss/**/*.scss')
	.pipe(frontnote({
		clean: true,
		css: '../css/stylesheet.css',
		out: './StyleGuide'
	}));
});

//画像圧縮
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

//監視
gulp.task('watch',function(){
	gulp.watch(["js/**/*.js","!js/min/**/*.js"],["js",'jsgzip']);
	gulp.watch(['scss/**/*.scss'],['compass','styleguide','cssgzip']);
});

//デフォルト設定
gulp.task('default', function(callback) {
	return runSequence(
		'compass',
		['watch'],
		callback
	);
});

//完成版作成
gulp.task('prod', function(callback){
	return runSequence(
		['compass','js'],
		['imagemin','styleguide','cssgzip','jsgzip'],
		callback
	);
});