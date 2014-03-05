var gulp = require('gulp');
var gulputil = require('gulp-util');
var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var rename = require('gulp-rename');

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

// JS hint task
gulp.task('jshint', function() {
	gulp.src('src/js/*.js')
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
	gulp.src( ['test/integration/*.js'] )
    	.pipe( shell(['node  <%= file.path %>']) );
});

// Default build task
gulp.task('default', ['scripts', 'unitTests'] );

// Runs development tasks (jshint, etc...)
gulp.task('dev', ['jshint', 'scripts', 'unitTests'] );

// Runs full testing suite (including stochastic integration)
gulp.task('test', ['unitTests', 'integration'] );