const { src, dest, series, parallel, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cssnano = require("gulp-cssnano");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const clean = require("gulp-clean");
const kit = require("gulp-kit");

const paths = {
	srcSass: "./src/sass/**/*.scss",
	srcJS: "./src/js/*.js",
	srcImg: "./src/img/*",
	srcHtml: "./html/*.kit",
	destSass: "./dist/css",
	destJS: "./dist/js",
	destImg: "./dist/img",
};

function buildStyles(done) {
	src(paths.srcSass)
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(
			rename({
				suffix: "-min",
			})
		)
		.pipe(sourcemaps.write())
		.pipe(dest(paths.destSass));

	done();
}

function buildJavaScript(done) {
	src(paths.srcJS)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ["@babel/env"],
			})
		)
		.pipe(uglify())
		.pipe(
			rename({
				suffix: "-min",
			})
		)
		.pipe(sourcemaps.write())
		.pipe(dest(paths.destJS));
	done();
}

function minImages(done) {
	src(paths.srcImg).pipe(imagemin()).pipe(dest(paths.destImg));
	done();
}

function startSyncBrowser(done) {
	browserSync.init({
		server: {
			baseDir: "./",
		},
	});
	watch("./*.html").on("change", reload);
	watch(
		[paths.srcHtml, paths.srcSass, paths.srcJS],
		parallel(handleKit, buildStyles, buildJavaScript)
	).on("change", reload);
	watch(paths.srcImg, minImages).on("change", reload);
	done();
}

function handleKit(done) {
	src(paths.srcHtml).pipe(kit()).pipe(dest("./"));
	done();
}

function cleanDist(done) {
	src("./dist", { read: false }).pipe(clean());
	done();
}

const mainFunctions = parallel(handleKit, buildStyles, buildJavaScript, minImages);
exports.default = series(mainFunctions, startSyncBrowser);
exports.cleanDist = cleanDist;
