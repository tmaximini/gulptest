var gulp = require('gulp'),
    compass = require('gulp-compass'),
    minifyCSS = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    embedlr = require('gulp-embedlr'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    livereload = require('connect-livereload')
    livereloadport = 35729,
    serverport = 5000;

//We only configure the server here and start it only when running the watch task
var server = express();
//Add livereload middleware before static-middleware
server.use(livereload({
  port: livereloadport
}));
server.use(express.static('./app'));

// //Task for sass using libsass through gulp-sass
// gulp.task('sass', function(){
//   gulp.src('app/css/sass/*.scss')
//     .pipe(sass())
//     .pipe(gulp.dest('app/css'))
//     .pipe(refresh(lrserver));
// });

gulp.task('compass', function() {
    gulp.src('app/css/sass/*.scss')
        .pipe(compass({
            css: 'app/css',
            sass: 'app/css/sass',
            image: 'app/images'
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('app/css'))
        .pipe(refresh(lrserver));
});

//Task for processing js with browserify
gulp.task('browserify', function(){
  gulp.src('app/js/{,*/}*.js')
   // .pipe(browserify())
   // .pipe(concat('frontend.js'))
   .pipe(gulp.dest('app/js'))
   .pipe(refresh(lrserver));

});

//Task for moving html-files to the app-dir
//added as a convenience to make sure this gulpfile works without much modification
gulp.task('html', function(){
  gulp.src('app/*.html')
    .pipe(gulp.dest('app'))
    .pipe(refresh(lrserver));
});

//Convenience task for running a one-off app
gulp.task('app', function() {
  gulp.run('html', 'browserify', 'compass');
});

gulp.task('serve', function() {
  //Set up your static fileserver, which serves files in the app dir
  server.listen(serverport);

  //Set up your livereload server
  lrserver.listen(livereloadport);
});

gulp.task('watch', function() {

  //Add watching on sass-files
  gulp.watch('app/css/sass/*.scss', function() {
    gulp.run('compass');
  });

  //Add watching on js-files
  gulp.watch('app/js/{,*/}*.js', function() {
    gulp.run('browserify');
  });

  //Add watching on html-files
  gulp.watch('app/*.html', function () {
    gulp.run('html');
  });
});

gulp.task('default', function () {
  gulp.run('app', 'serve', 'watch');
});