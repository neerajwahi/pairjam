var gulp = require('gulp');
var util = require('gulp-util');
var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var preprocess = require('gulp-preprocess');
var ghpages = require('gulp-gh-pages');
var autoprefixer = require('gulp-autoprefixer');

// Basic usage
gulp.task('scripts', function() {
	// Single entry point to browserify
	gulp.src('src/js/main.jsx')
	    .pipe(browserify({
			transform: ['reactify'],
			insertGlobals : false,
			debug : !util.env.production
	     }))
	    .pipe(rename('main.js'))
	    .pipe(gulp.dest('./public/js'));
});

gulp.task('gh-pages', function () {
	gulp.src('public/**/*')
		.pipe(ghpages('https://github.com/neerajwahi/pairjam.git', 'origin'));
});

gulp.task('prod_scripts', function() {
	process.env.NODE_ENV = "production";

	// Single entry point to browserify
	gulp.src('src/js/main.jsx')
	    .pipe(browserify({
			transform: ['reactify'],
			insertGlobals : false,
			debug : false
	     }))
	    .pipe(rename('main.js'))
	    .pipe(preprocess())
	    .pipe(uglify({
	    	mangle: true,
	    	compress: {}
	    }))
	    .pipe(gulp.dest('./public/js'));
});

// SASS
gulp.task('sass', function () {
    gulp.src('src/scss/main.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest('./public/css'));
});

gulp.task('prod_sass', function () {
    gulp.src('src/scss/main.scss')
        .pipe(sass({style: 'compressed'}))
        .pipe(gulp.dest('./public/css'));
});

// JS hint task
gulp.task('jshint', function() {
	gulp.src(['src/js/*.js','../lib/ot/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Unit tests (mocha)
gulp.task('unitTests', function() {
	gulp.src(['test/unit/*.js'])
    	.pipe(mocha({reporter: 'spec'}));
});

// Integration tests (run using node)
gulp.task('integration', function() {
	gulp.src(['test/system/*.js'])
    	.pipe(shell(['node  <%= file.path %>']));
});

// Watch folders for changes
gulp.task('watch', function() {
	gulp.watch('src/js/**/*.{js,jsx}', ['scripts']);
	gulp.watch('src/scss/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'scripts'] );
gulp.task('dev', ['sass', 'jshint', 'scripts', 'unitTests'] );
gulp.task('prod', ['prod_sass', 'prod_scripts']);
gulp.task('deploy', ['prod_sass', 'prod_scripts', 'gh-pages']);

// Runs full testing suite (including stochastic integration)
gulp.task('test', ['unitTests', 'integration'] );
