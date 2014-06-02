var gulp = require('gulp');
var minifyHTML = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('html', function() {
    gulp.src('./src/*.html')
        .pipe(minifyHTML())
        .pipe(gulp.dest('./'));
});

gulp.task('css', function() {
    gulp.src('./src/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('./'));
});

gulp.task('js', ['browserify'], function() {
    gulp.src('./script.js')
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});

gulp.task('browserify', function() {
    return browserify('./src/script.js')
        .bundle({ debug: true})
        .pipe(source('script.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', ['default'], function() {
    gulp.watch('./src/*.html', ['html']);
    gulp.watch('./src/*.css', ['css']);
    gulp.watch('./src/*.js', ['js']);
});

gulp.task('default', ['html', 'css', 'js']);