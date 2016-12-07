var gulp = require('gulp'),
    gutil = require('gulp-util'),
    scss = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    fileinclude = require('gulp-file-include'),
    gulpRemoveHtml = require('gulp-remove-html'),
    htmlmin = require('gulp-htmlmin'),
    bourbon = require('node-bourbon'),
    ftp = require('vinyl-ftp'),
    notify = require("gulp-notify"),
    gcmq = require('gulp-group-css-media-queries');

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
});

gulp.task('scss', ['headerscss'], function () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(scss({
            includePaths: bourbon.includePaths
        }).on("error", notify.onError()))
        .pipe(gcmq())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('headerscss', function () {
    return gulp.src('app/header.scss')
        .pipe(scss({
            includePaths: bourbon.includePaths
        }).on("error", notify.onError()))
        .pipe(gcmq())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function () {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/jquery-storage-api/jquery.storageapi.min.js',
        'app/libs/jquery-easing/jquery.easing.min.js',
        'app/libs/wow/dist/wow.min.js',
        'app/libs/hammerjs/hammer.min.js',
        'app/libs/fullpage.js/vendors/scrolloverflow.min.js',
        'app/libs/fullpage.js/dist/jquery.fullpage.min.js',
        'app/libs/jquery.cookie/jquery.cookie.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

gulp.task('watch', ['scss', 'libs', 'browser-sync'], function () {
    gulp.watch('app/header.scss', ['headerscss']);
    gulp.watch('app/scss/**/*.scss', ['scss']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('imagemin', function () {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('buildhtml', function () {
    gulp.src(['app/*.html'])
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(gulpRemoveHtml())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('buildyaml', function () {
    gulp.src(['app/app.yaml'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('removedist', function () {
    return del.sync('dist');
});

gulp.task('build', ['removedist', 'buildhtml', 'buildyaml', 'imagemin', 'scss', 'libs'], function () {

    var buildCss = gulp.src([
        'app/css/fonts.min.css',
        'app/css/main.min.css'
    ]).pipe(gulp.dest('dist/css'));

    var buildFiles = gulp.src([
        'app/.htaccess'
    ]).pipe(gulp.dest('dist'));

    var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('dist/js'));

});

gulp.task('deploy', function () {

    var conn = ftp.create({
        host: 'hostname.com',
        user: 'username',
        password: 'userpassword',
        parallel: 10,
        log: gutil.log
    });

    var globs = [
        'dist/**',
        'dist/.htaccess',
    ];
    return gulp.src(globs, {buffer: false})
        .pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('default', ['watch']);
