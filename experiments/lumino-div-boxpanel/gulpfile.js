const gulp = require("gulp");
const filter = require('gulp-filter');

gulp.task("resources-to-lib", async function() {
  const f = filter([
    '**',
    '!src/**/*.ts',
    '!src/**/*.tsx',
    '!src/**/*.js'
  ]);
  gulp.src('./src/**/*.*')
    .pipe(f)
    .pipe(gulp.dest('./lib/'));
    return;
})
