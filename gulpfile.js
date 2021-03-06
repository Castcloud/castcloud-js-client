var gulp = require('gulp');
var replace = require('gulp-replace');
var gulpif = require('gulp-if');
var minifyHTML = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var reactify = require('reactify');
var strictify = require('strictify');
var watchify = require('watchify');

var fs = require('fs');
var argv = require('yargs')
    .alias('p', 'production')
    .argv;

var cfg;
if (fs.existsSync('config.js')) {
    cfg = require('./config.js');
}
else {
    cfg = require('./config.default.js');
    fs.createReadStream('config.default.js').pipe(fs.createWriteStream('config.js'));
}

gulp.task('html', function() {
    gulp.src('./src/*.html')
        .pipe(replace('{{root}}', cfg.client_root))
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
    return js(false);
});

function js(watch) {
    var bundler, rebundle;
    bundler = browserify('./src/js/script.js', {
        debug: !argv.production,
        cache: {},
        packageCache: {},
        fullPaths: watch
    });

    if (watch) {
        bundler = watchify(bundler);
    }

    bundler
        .transform(reactify)
        .transform(strictify);

    rebundle = function() {
        var stream = bundler.bundle();
        stream.on('error', console.log);
        return stream
            .pipe(source('script.js'))
            .pipe(gulpif(argv.production, streamify(uglify())))
            .pipe(gulp.dest('./dist'));
    };

    bundler.on('time', function(time) {
        console.log('JS bundle: ' + time + ' ms');
    });
    bundler.on('update', rebundle);
    return rebundle();
}

gulp.task('img', function() {
    gulp.src('./src/img/*')
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('watch', ['default'], function() {
    gulp.watch('./src/*.html', ['html']);
    gulp.watch('./src/*.css', ['css']);
    return js(true);
});

gulp.task('extras', function () {
    gulp.src('./src/.htaccess')
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['html', 'css', 'js', 'img', 'extras']);
