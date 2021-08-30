import gulp from "gulp"
const { series } = gulp
import imagemin from 'gulp-imagemin';
import uglify from "gulp-uglify"
import sa from "sass"
import gulpSass from "gulp-sass"

const sass = gulpSass(sa)

/*
  -- TOP LEVEL FUNCTIONS --
  gulp.task - Define tasks
  gulp.src - Point to files to use
  gulp.dest - Points to folder to output
  gulp.watch - watch files and folder for changes
*/

// Log Message
// gulp.task("message", function () {
//     console.log("Gulp is running...");
//     return
// })
export function message(cb) {
    console.log("Gulp is running...");
    cb()
}

// Copy All HTML files
// gulp.task('copyHtml', function () {
//     gulp.src('src/*.html')
//         .pipe(gulp.dest('dist'));
// })
export async function copyHtml(cb) {
    gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
    cb()
}

// Optimize Images
// gulp.task("imageMin", function () {
//     gulp.src('src/images/*')
//         .pipe(imagemin())
//         .pipe(gulp.dest('dist/images'))
// })
// I can't run this task correctly.
export function imageMin(cb) {
    gulp.src('src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
    cb()
}

// Minify JS
// gulp.task("minifyJS", function () {
//     gulp.src("src/js/*.js")
//         .pipe(uglify())
//         .pipe(gulp.dest("dist/js"))
// })
export function minifyJS(cb) {
    gulp.src("src/js/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"))
    cb()
}


// Compile Sass
// gulp.task("sass", async function () {
//     gulp.src("src/sass/*scss")
//         .pipe(sass().on("error", sass.logError))
//         .pipe(gulp.dest('dist/css'))
// })
export function buildSass(cb) {
    gulp.src("src/sass/*scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest('dist/css'))
    cb()
}


// run all task by default
// gulp.task("default", ['message', 'copyHtml', "minifyJS", "sass"])
export default series(message, copyHtml, minifyJS, buildSass)