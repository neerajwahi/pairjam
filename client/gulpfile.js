var gulp = require('gulp');
var gulputil = require('gulp-util');
var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var rename = require('gulp-rename');
var sass = require('gulp-sass');

// Basic usage
gulp.task('scripts', function() {
	// Single entry point to browserify
	gulp.src('src/js/main.jsx')
	    .pipe( browserify({
			transform: ['reactify'],
			insertGlobals : false,
			debug : !gulputil.env.production
	     }) )
	    .pipe( rename('main.js') )
	    .pipe( gulp.dest('./public/js') );
});

// SASS
gulp.task('sass', function () {
    gulp.src('src/scss/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('./public/css'));
});

// JS hint task
gulp.task('jshint', function() {
	gulp.src(['src/js/*.js','../lib/ot/*.js'])
		.pipe( jshint() )
		.pipe( jshint.reporter('default') );
});

// Unit tests (mocha)
gulp.task('unitTests', function() {
	gulp.src( ['test/unit/*.js'] )
    	.pipe( mocha({ reporter: 'spec' }) );
});

// Integration tests (run using node)
gulp.task('integration', function() {
	gulp.src( ['test/system/*.js'] )
    	.pipe( shell(['node  <%= file.path %>']) );
});

gulp.task('watch', function() {
	gulp.watch('src/js/**/*.{js,jsx}', ['scripts']);
	gulp.watch('src/scss/**/*.scss', ['sass']);
});

// Default build task
gulp.task('default', ['sass', 'scripts'] );

// Runs development tasks (jshint, etc...)
gulp.task('dev', ['sass', 'jshint', 'scripts', 'unitTests'] );

// Runs full testing suite (including stochastic integration)
gulp.task('test', ['unitTests', 'integration'] );
