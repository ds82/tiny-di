'use strict';
require('source-map-support').install();

var fs     = require('fs');

var gulp     = require('gulp');
var babel    = require('gulp-babel');
var smaps    = require('gulp-sourcemaps');
var rename   = require('gulp-rename');
var jasmine  = require('gulp-jasmine');

gulp.task('babel', function() {
  return gulp.src('index.es6')
    .pipe(smaps.init())
    .pipe(babel())
    .pipe(rename('index.js'))
    .pipe(smaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function() {
  return gulp.src('spec/*.spec.js')
    .pipe(jasmine({
      verbose: true,
      includeStackTrace: true
    }));
});

gulp.task('watch', ['babel'], function() {
  gulp.watch(['index.es6'], ['babel']);
  gulp.watch(['dist/index.js', 'spec/*.spec.js'], ['test']);
});

gulp.task('default', ['babel']);
