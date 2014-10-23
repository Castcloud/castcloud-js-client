var gulp = require('gulp');
var minifyHTML = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var strictify = require('strictify');

gulp.task('html', function() {
    gulp.src('./src/*.html')
        .pipe(minifyHTML())
        .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
    gulp.src('./src/*.css')
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
    return browserify('./src/script.js')
        .transform(strictify)
        .bundle()
        .pipe(source('script.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./dist'));
});

gulp.task('img', function() {
    gulp.src('./src/img/*')
        .pipe(gulp.dest('./dist/img'));
})

gulp.task('watch', ['default'], function() {
    gulp.watch('./src/*.html', ['html']);
    gulp.watch('./src/*.css', ['css']);
    gulp.watch('./src/*.js', ['js']);
});

gulp.task('default', ['html', 'css', 'js', 'img']);