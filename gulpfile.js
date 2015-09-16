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

// it's optional, if you want to use sass instead of compass
// so replace 'compass' to 'sass' in 'default' task and 'watch'
gulp.task('sass', function()
{
   return gulp.src('src/sass/style.scss')
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

gulp.task('dependency', ['depsScripts']);

// all scss files should be imported into main.scss file
// bootstrap style is included into main.scss from bower component
// gulp-compass minify main.scss file and copy it into dist directory with source map
gulp.task('compass', function() {
    gulp.src('src/sass/main.scss')
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
        .pipe(compass({
            style: 'compressed',
            sourcemap: true,
            css: 'dist/styles',
            sass: 'src/sass'
        }))
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
    return gulp.src(['src/scripts/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat("main.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
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

// any update of scripts, stylesheet, fonts or images
gulp.task('watch', function()
{
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('src/sass/**/*.scss', ['compass']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    gulp.watch('src/images/**/*', ['images']);
    gulp.watch('src/fonts/**/*', ['fonts']);
    gulp.watch("./*.html").on('change', browserSync.reload);
});

// default task run all the tasks
gulp.task('default', function(callback){
    runSequence('dependency', 'compass', 'scripts', 'images', 'fonts', callback);
});
