const SpritesmithPlugin = require("webpack-spritesmith");
const CompressionWebpackPlugin = require("compression-webpack-plugin");

const path = require("path");
const resolve = dir => path.join(__dirname, dir);

const IS_PROD = process.env.NODE_ENV === "production";

// 雪碧图样式处理模板
const SpritesmithTemplate = data => {
  let tpl = "";
  data.sprites.forEach(sprite => {
    const { name, width, height, offset_x, offset_y } = sprite;
    tpl = `${tpl}
.icon-${name} {
  display: inline-block;
  background-image: url(~@images/sprite/${sprite.image});
  width: ${width}px;
  height: ${height}px;
  background-position: ${offset_x}px ${offset_y}px;
}`;
  });
  return tpl;
};

module.exports = {
  publicPath: "./", // 默认'/'，部署应用包时的基本 URL
  // assetsDir: "static", //放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  configureWebpack: config => {
    config.resolve.modules = ["node_modules", "./src/assets/images/sprite"];

    const plugins = [
      // 自动生成雪碧图
      new SpritesmithPlugin({
        src: {
          cwd: resolve("./src/assets/images/sprite/icons"), // 图标根路径
          glob: "**/*.png", // 匹配任意 png 图标
        },
        target: {
          image: resolve("./src/assets/images/sprite/sprites.png"), // 生成雪碧图目标路径与名称
          // 设置生成CSS背景及其定位的文件或方式
          css: [
            [
              resolve("./src/assets/images/sprite/sprites.scss"),
              {
                // 调用自定义模板
                format: "function_based_template",
              },
            ],
          ],
        },
        // 自定义模板
        customTemplates: {
          function_based_template: SpritesmithTemplate,
        },
        apiOptions: {
          cssImageRef: "sprites.png",
        },
        spritesmithOptions: {
          algorithm: "top-down",
          padding: 2,
        },
      }),
    ];

    if (IS_PROD) {
      plugins.push(
        // 开启gzip压缩
        new CompressionWebpackPlugin({
          filename: "[path].gz[query]",
          algorithm: "gzip",
          test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i,
          threshold: 10240, // 只有大小大于该值的资源会被处理 10240
          minRatio: 0.8, // 只有压缩率小于这个值的资源才会被处理
          deleteOriginalAssets: false // 删除原文件
        })
      );
    }

    config.plugins = [...config.plugins, ...plugins];
  },
  chainWebpack: config => {
    // 修复HMR 热更新失效时使用
    // config.resolve.symlinks(true);

    // 添加别名
    config.resolve.alias
      .set("vue$", "vue/dist/vue.esm.js")
      .set("@", resolve("src"))
      .set("@assets", resolve("src/assets"))
      .set("@styles", resolve("src/assets/styles"))
      .set("@images", resolve("src/assets/images"))
      .set("@components", resolve("src/components"))
      .set("@static", resolve("src/static"));
  },
  css: {
    sourceMap: false,
    loaderOptions: {
      scss: {
        // 向全局sass样式传入共享的全局变量
        prependData: `
          @import "@styles/helper/_helper.scss";
        `,
      },
    },
  },
  lintOnSave: false, // 保存时进行eslint检测
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false, // 生产环境的 source map
  devServer: {
    open: true, // 是否打开浏览器
  },
};
