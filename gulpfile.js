const gulp = require('gulp');
const less = require('gulp-less');

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */
function compileLESS() {
  return gulp.src("styles/tenebris.less")
      .pipe(less())
      .pipe(gulp.dest("./css"))
}
const css = gulp.series(compileLESS);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */
const SIMPLE_LESS = ["styles/*.less"];

function watchUpdates() {
  gulp.watch(SIMPLE_LESS, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
    gulp.parallel(css),
    watchUpdates
);
exports.css = css;

