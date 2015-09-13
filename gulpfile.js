// ## Globals

var gulp 			= require('gulp');
var concat 			= require('gulp-concat');
var sass            = require('gulp-sass');
var minifyCss       = require('gulp-minify-css');
var autoprefix      = require('gulp-autoprefixer');
var rename 			= require('gulp-rename');
var jshint          = require('gulp-jshint');
var uglify 			= require('gulp-uglify');
var runSequence     = require('run-sequence').use(gulp);
var watch           = require('gulp-watch');
var browserSync     = require('browser-sync').create();
var plumber         = require('gulp-plumber');
var flatten         = require('gulp-flatten');
var imagemin        = require('gulp-imagemin');
var compass         = require('gulp-compass');
var path            = require('path');

// this task compile scss files with compass @mixin, variable to dist directory
gulp.task('compass', function() {
    gulp.src('assets/sass/main.scss')
        .pipe(plumber())
        .pipe(compass({
            project: path.join(__dirname, 'assets'),
            css: 'css',
            sass: 'sass',
            image: 'img',
            cache: false
        }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.stream());
});

// minify css
gulp.task('minifyCss', function()
{
    return gulp.src(['assets/css/main.css'])
        .pipe(autoprefix('last 2 versions'))
        .pipe(rename('main.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('jshint', function() {
    gulp.src('assets/js/main.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// minify dependent scripts from bower to dist directory
// jquery.js, modernizr.js, bootstrap.js
gulp.task('scripts', ['jshint'],function()
{
    return gulp.src(['bower_components/jquery/dist/jquery.js',
        'bower_components/modernizr/modernizr.js',
        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
        'assets/js/main.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('images', function() {
    return gulp.src(['assets/img/**/*'])
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
    return gulp.src('assets/fonts/**/*')
        .pipe(flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe(browserSync.stream());
});

gulp.task('watch', ['minifyCss'], function()
{
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('assets/sass/*.scss', ['compass']);
    gulp.watch('assets/css/*.css', ['minifyCss']);
    gulp.watch('assets/js/*.js', ['scripts']);
    gulp.watch('assets/img/**/*', ['images']);
    gulp.watch('assets/fonts/**/*', ['fonts']);
    gulp.watch("./*.html").on('change', browserSync.reload);
});

gulp.task('default', function(callback){
    runSequence('compass', 'minifyCss', 'scripts', 'images', 'fonts', callback);
});
