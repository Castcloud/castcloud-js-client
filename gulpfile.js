var gulp = require('gulp');
var minifyHTML = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');

gulp.task('html', function() {
    gulp.src('./src/*.html')
        .pipe(minifyHTML())
        .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
    gulp.src('./src/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
    return browserify('./src/script.js')
        .bundle()
        .pipe(source('script.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./dist'))
});

gulp.task('watch', ['default'], function() {
    gulp.watch('./src/*.html', ['html']);
    gulp.watch('./src/*.css', ['css']);
    gulp.watch('./src/*.js', ['js']);
});

gulp.task('default', ['html', 'css', 'js']);