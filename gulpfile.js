// ## Globals

var gulp 			= require('gulp');
var sass            = require('gulp-sass');
var minifyCss       = require('gulp-minify-css');
var sourcemaps      = require('gulp-sourcemaps');
var autoprefix      = require('gulp-autoprefixer');
var rename 			= require('gulp-rename');
var jshint          = require('gulp-jshint');
var uglify 			= require('gulp-uglify');
var concat 			= require('gulp-concat');
var runSequence     = require('run-sequence').use(gulp);
var watch           = require('gulp-watch');
var browserSync     = require('browser-sync').create();
var plumber         = require('gulp-plumber');
var flatten         = require('gulp-flatten');
var imagemin        = require('gulp-imagemin');
var compass         = require('gulp-compass');
var path            = require('path');

// ## tasks

// dependency stylesheet i.e. bootstrap compile from bower_component
// and copy it to dist directory with source map
gulp.task('depsStyles', function()
{
    gulp.src('src/app/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/styles'));
});

// minify dependency scripts and copy to scripts directory
gulp.task('depsScripts',function()
{
    return gulp.src(['bower_components/jquery/dist/jquery.js',
        'bower_components/modernizr/modernizr.js',
        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});

gulp.task('dependency', ['depsStyles','depsScripts']);

// it compiles all scss files for development,
// create source maps
// minified and transferred to dist
// plumber used to catch error
gulp.task('styles', function() {
    gulp.src('src/sass/*.scss')
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
        .pipe(compass({
            css: 'dist/styles',
            sass: 'src/sass'
        }))
        .pipe(sourcemaps.init())
        .pipe(minifyCss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.stream());
});


gulp.task('jshint', function() {
    gulp.src('src/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// minify dependent scripts from bower to dist directory
// jquery.js, modernizr.js, bootstrap.js
gulp.task('scripts', ['jshint'],function()
{
    return gulp.src(['src/scripts/main.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});

gulp.task('images', function() {
    return gulp.src(['src/images/**/*'])
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
    return gulp.src('src/fonts/**/*')
        .pipe(flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe(browserSync.stream());
});

gulp.task('watch', function()
{
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('src/sass/**/*.scss', ['styles']);
    gulp.watch('src/scripts/*.js', ['scripts']);
    gulp.watch('src/images/**/*', ['images']);
    gulp.watch('src/fonts/**/*', ['fonts']);
    gulp.watch("./*.html").on('change', browserSync.reload);
});

gulp.task('default', function(callback){
    runSequence('dependency', 'styles', 'scripts', 'images', 'fonts', callback);
});
