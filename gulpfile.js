var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

function build() {
    return browserify({
            entries: './main.js',
            debug: true,
        })
        .transform(babelify, {
			presets: ["es2015"]
		})
        .bundle().on('error', function(error) {
			gutil.log(gutil.colors.red('[Build Error]', error.annotated || error.message));
            this.emit('end');
        })
        .pipe(source('game.js'))
        .pipe(gulp.dest('./build'));
}

gulp.task('build', build);
gulp.task('default', ['build']);