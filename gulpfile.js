'use strict';

var fs     = require('fs');

var gulp   = require('gulp');
var to5    = require('gulp-6to5');
var smaps  = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var minimist = require('minimist');

var options = minimist(process.argv.slice(2));

gulp.task('6to5', function() {
  return gulp.src('index.es6')
    .pipe(smaps.init())
    .pipe(to5())
    .pipe(rename('index.js'))
    .pipe(smaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['6to5'], function() {
  gulp.watch(['index.es6'], ['6to5']);
});

gulp.task('set-version', function() {
  if (options.version) {
    var pack = require('./package.json');
    pack.version = options.version;
    fs.writeFileSync('package.json', JSON.stringify(pack, null, '  '));
  }
});

gulp.task('default', ['6to5']);

