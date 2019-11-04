const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const webpack = require('webpack-stream');
const del = require('del');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

const webpackConfig = require('./webpack.config');

const paths = {
  root: './dist',
  pug: {
    src: 'src/pug/main.pug',
    dest: './dist',
  },
  sass: {
    src: 'src/assets/sass/**/*.{sass,scss}',
    dest: './dist/assets/css',
  },
  js: {
    src: 'src/assets/js/**/*.js',
    dest: './dist/assets/js',
  },
  img: {
    src: 'src/assets/img/**/*.{jpeg,jpg,png}',
    dest: './dist/assets/img',
  },
  svg: {
    src: 'src/assets/img/**/*.svg',
    dest: './dist/assets/img',
  },
  fonts: {
    src: 'src/assets/fonts/**/*',
    dest: './dist/assets/fonts',
  },
};

// server
function server() {
  browserSync.init({
    server: {
      port: 3000,
      baseDir: paths.root,
    },
    notify: false,
  });

  gulp.watch(paths.pug.src, templates);
  gulp.watch(paths.sass.src, styles);
  gulp.watch(paths.img.src, image);
  gulp.watch(paths.svg.src, svg);
  gulp.watch(paths.js.src, scripts);
  gulp.watch(paths.fonts.src, copyFonts);
}

// pug
function templates() {
  return gulp
    .src(paths.pug.src)
    .pipe(pug({ pretty: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browserSync.stream());
}

// style
function styles() {
  return gulp
    .src(paths.sass.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(browserSync.stream());
}

//image
function image() {
  return gulp
    .src(paths.img.src)
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
      })
    )
    .pipe(gulp.dest(paths.img.dest));
}

// svg sprite
function svg() {
  return gulp
    .src(paths.svg.src)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(
      cheerio({
        run: function($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: '../svg-sprite/sprite.svg',
          },
        },
      })
    )
    .pipe(gulp.dest(paths.svg.dest));
}

// js
function scripts() {
  return gulp
    .src(paths.js.src)
    .pipe(webpack(webpackConfig))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream());
}

// fonts
function copyFonts() {
  return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}

// delete
function clean() {
  return del(paths.root);
}

exports.templates = templates;
exports.styles = styles;
exports.server = server;
exports.scripts = scripts;
exports.clean = clean;
exports.image = image;
exports.svg = svg;
exports.copyFonts = copyFonts;

exports.default = gulp.series(
  clean,
  gulp.parallel(templates, styles, scripts, image, svg, copyFonts),
  server
);
