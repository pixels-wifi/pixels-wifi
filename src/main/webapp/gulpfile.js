var argv = require('yargs').argv;
var autoprefixer = require("gulp-autoprefixer");
var header = require("gulp-header");
var browserSync = require("browser-sync");
var historyApiFallback = require("connect-history-api-fallback");
var eslint = require("gulp-eslint");
var gulp = require("gulp");
var gutil = require("gulp-util");
var sass = require("gulp-sass");
var cleanCSS = require("gulp-clean-css");
var path = require("path");
var replace = require("gulp-replace");
var uglify = require("gulp-uglify");
var webpack = require("webpack");
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require("webpack-hot-middleware");
var proxy = require('proxy-middleware');
var url = require('url');

var packageInfo = require("./package");

var isDev = process.env.NODE_ENV !== "production";

var dirs = {
  src: "./src",
  js: "./src/js",
  dist: process.env.DIST_DIR || "../resources/dist",
  styles: "./src/css",
  node_modules: "./node_modules",
  img: "./src/img",
  imgDist: "img",
  fonts: [
    "./src/fonts",
    "./node_modules/font-awesome/fonts"
  ],
  fontsDist: "fonts",
  release: "./release",
  mocks: "./mock-server"
};

var files = {
  mainJs: "main",
  mainJsDist: "main",
  mainSass: "main",
  criticalSass: "critical",
  mainCssDist: "main",
  criticalCssDist: "critical",
  index: "index.html"
};

var servers = {
  local: "http://localhost:8080"
};

var webpackConfig = {
  entry: [
    path.resolve(dirs.js + "/" + files.mainJs + ".jsx")
  ],
  output: {
    path: path.resolve(dirs.dist),
    filename: files.mainJsDist + ".js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [{
          loader: "babel-loader"
        }],
        exclude: [/node_modules/, /vendor/]
      },
      {
        test: /\.js$/,
        enforce: "pre",
        loader: "source-map-loader",
        exclude: /node_modules/
      },
      {
        test: /\.pegjs$/,
        use: [{
          loader: 'pegjs-loader'
        }],
      }
    ],
    noParse: [/autoit\.js$/]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      DASHBOARD_MOCK: false
    })
  ],
  resolve: {
    alias: {
      app: path.resolve(dirs.js)
    },
    extensions: [".jsx", ".js"]
  }
};

// Use webpack to compile jsx into js,
gulp.task("webpack", function (callback) {
  webpack(webpackConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    }

    gutil.log("[webpack]", stats.toString({
      children: false,
      chunks: false,
      colors: true,
      modules: false,
      timing: true
    }));

    callback();
  });
});

gulp.task("eslint", function () {
  return gulp.src([
    dirs.js + "/**/*.?(js|jsx)",
    "!" + dirs.js + "/vendor/*"
  ])
    .pipe(eslint())
    .pipe(eslint.formatEach("stylish", process.stderr));
});

gulp.task("eslint-mockserver", function () {
  return gulp.src([
    dirs.mocks + "/**/*.?(js|jsx)"
  ])
    .pipe(eslint())
    .pipe(eslint.formatEach("stylish", process.stderr));
});

gulp.task("sass", function () {
  return gulp.src([
    dirs.styles + "/" + files.mainSass + ".scss",
    dirs.styles + "/" + files.criticalSass + ".scss"
  ])
  .pipe(sass({
    includePaths: [ // @import paths
      dirs.styles,
      dirs.node_modules
    ]
  }).on("error", sass.logError))
  .pipe(autoprefixer())
  .pipe(gulp.dest(dirs.dist))
  .pipe(browserSync.stream());
});

gulp.task("minify-css", ["sass"], function () {
  return gulp.src([
    dirs.dist + "/" + files.mainCssDist + ".css",
    dirs.dist + "/" + files.criticalCssDist + ".css"
  ])
  .pipe(cleanCSS())
  .pipe(gulp.dest(dirs.dist));
});

gulp.task("minify-js", ["webpack"], function () {
  var banner = "/**\n" +
    " * <%= pkg.name %> - <%= pkg.description %>\n" +
    " * @version v@@TEAMCITY_UI_VERSION\n" +
    " * @buildnumber @@TEAMCITY_BUILDNUMBER\n" +
    " * @branchname @@TEAMCITY_BRANCHNAME\n" +
    " */\n";

  return gulp.src(dirs.dist + "/" + files.mainJs + ".js")
    .pipe(uglify())
    .pipe(header(banner, {pkg : packageInfo}))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("images", function () {
  return gulp.src(dirs.img + "/**/*.*")
    .pipe(gulp.dest(dirs.dist + "/" + dirs.imgDist));
});

gulp.task("fonts", function () {
  return gulp.src(
    dirs.fonts.map(function (dir) {
      return dir + "/**/*.*";
    }))
    .pipe(gulp.dest(dirs.dist + "/" + dirs.fontsDist));
});

gulp.task("index", function () {
  return gulp.src(dirs.src + "/" + files.index)
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("browsersync", function () {
  if (isDev) {
    webpackConfig.entry = ["webpack/hot/dev-server", "webpack-hot-middleware/client"]
      .concat(webpackConfig.entry);

    webpackConfig.module.rules[0].use = [{loader: "react-hot-loader"}]
      .concat(webpackConfig.module.rules[0].use);

    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    if (!process.env.DISABLE_SOURCE_MAP || process.env.DISABLE_SOURCE_MAP === "false") {
      webpackConfig.devtool = "eval";
    }
  }

  var compiler = webpack(webpackConfig);

  var proxyOptions = url.parse(argv.mock ? servers.mock : servers.local);
  proxyOptions.route = '/api';

  browserSync.init({
    ghostMode: false,
    server: {
      baseDir: path.resolve(dirs.dist),

      middleware: [
        proxy(proxyOptions),
        webpackDevMiddleware(compiler, {
          publicPath: webpackConfig.output.publicPath,
          stats: {
            colors: true,
            chunkModules: false
          }
        }),
        webpackHotMiddleware(compiler),
        historyApiFallback()
      ]
    }
  });
});

gulp.task("watch", function () {
  gulp.watch(dirs.styles + "/**/*", ["sass"]);
  gulp.watch(dirs.js + "/**/*.?(js|jsx)", ["eslint"]);
  gulp.watch(dirs.img + "/**/*.*", ["images"]);
  gulp.watch(dirs.fonts + "/**/*.*", ["fonts"]);
});

gulp.task("watch-mockserver", function () {
  gulp.watch(dirs.mocks + "/**/*.?(js|jsx)", ["eslint-mockserver"]);
});

gulp.task("replace-js-strings", ["webpack", "eslint", "minify-js"], function () {
  return gulp.src(dirs.dist + "/main.js")
    .pipe(replace("@@ENV", process.env.NODE_ENV))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("mockserver", ["eslint-mockserver", "watch-mockserver"], function () {
  var nodemon = require("gulp-nodemon");

  return nodemon({
    nodeArgs: ["-r", "babel-register"],
    script: "mock-server/server.js",
    ext: "js",
    watch: ["mock-server"]
  });
});

gulp.task("livereload", ["eslint", "sass", "images", "fonts", "index", "browsersync", "watch"]);

var tasks = [
  "eslint",
  "webpack",
  "sass",
  "images",
  "fonts",
  "index"
];

if (!isDev) {
  tasks.push("minify-css", "minify-js", "replace-js-strings");
}
gulp.task("default", tasks);
