const { src, dest, parallel, series, watch } = require('gulp')
const sync = require('browser-sync').create()
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const fileinclude = require('gulp-file-include')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const strip = require('gulp-strip-comments')

function browserSync() {
	sync.init({
		server: {
			baseDir: './dist',
		},
	})
}

function html() {
	return src('src/**.html').pipe(fileinclude()).pipe(dest('dist'))
	// .pipe(sync.stream())
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/swiper/swiper-bundle.min.js',
		'src/js/svg_icons.js',
		'src/js/app.js'
	])
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(strip())
		.pipe(dest('dist/js/'))
		.pipe(sync.stream())
}

function styles() {
	return src(['src/scss/main.scss'])
		.pipe(sass())
		.pipe(concat('app.min.css'))
		.pipe(
			autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })
		)
		.pipe(cleanCSS({ level: { 1: { specialComments: false } } }))
		.pipe(dest('dist/css/'))
		.pipe(sync.stream())
}

function images() {
	return (
		src(['src/images/*', 'src/images/sochial/*'])
			.pipe(newer('dist/images'))
			//   .pipe(imagemin([
			//     imagemin.gifsicle({interlaced: true}),
			//     imagemin.mozjpeg({quality: 75, progressive: true}),
			//     imagemin.svgo({
			//         plugins: [
			//             {removeViewBox: true},
			//             {cleanupIDs: false}
			//         ]
			//     })
			// ]))
			.pipe(dest('dist/images'))
	)
}

function startwatch() {
	watch('src/**/*.scss', styles)
	watch('src/**/*.js', scripts)
	watch(['src/**.html', 'src/**/*.html'], html).on('change', sync.reload)
}

exports.browserSync = browserSync
exports.scripts = scripts
exports.styles = styles
exports.html = html
exports.images = images
exports.startwatch = startwatch
exports.default = parallel(
	scripts,
	styles,
	html,
	images,
	browserSync,
	startwatch
)
