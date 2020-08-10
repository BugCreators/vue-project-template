# vue项目脚手架

基于Vue-cli 4

## 图标使用说明

图标文件统一使用png格式

项目图标存放路径: `src/assets/images/sprite/icons`

重新启动项目会自动更新 `sprites.scss` 文件

直接使用文件中提供的类即可

类命名规则: `icon-文件名`

## 项目结构
``` bash
├── public/                            # 任何放置在该文件夹的静态资源都会被简单的复制，而不经过 webpack。
├── ├── static/                        # 通过标签引入的静态资源
│   └── index.html                     # HTML 模板
├── src/                               # 源码目录
│   ├── assets/                        # 静态资源
│   │   ├── images/                    # 图片资源
│   │   │   ├── components/            
│   │   │   └── sprite/                # 雪碧图相关目录
│   │   │       ├── icons/             # icon 图标目录
│   │   │       ├── sprites.png        # 雪碧图
│   │   │       └── sprites.scss       # icon 图标样式
│   │   ├── js/
│   │   │   ├── http/                       
│   │   │   │   ├── api.js             # api 接口
│   │   │   │   ├── http.js            # axios 配置
│   │   │   │   └── modules/           # 按模块区分的 api 接口
│   │   │   │       └── ...
│   │   │   └── utils.js               # 公共方法
│   │   ├── sass/                  
│   │   │   ├── base/                  # 浏览器默认样式
│   │   │   ├── helper/
│   │   │   │   ├── _common-mixin.scss # 常用样式mixins
│   │   │   │   ├── _helper.scss       
│   │   │   │   ├── _mixins.scss       # 常用mixins
│   │   │   │   └── _variables.scss    # 常用常量
│   │   │   ├── vendor/                
│   │   │   │   └── _ui-reset.scss     # UI重置，包括常用标签、自定义标签和elementUI
│   │   │   └── style.scss
│   │   └── theme/                     # elementUI 主题配置
│   ├── components/                    # 组件目录
│   │   └── ...
│   ├── router/                        # 路由配置
│   │   └── index.js 
│   ├── store/                         # vuex
│   │   ├── modules/                   # vuex 模块目录
│   │   │   └── ...
│   │   └── index.js 
│   ├── views/                         # 页面目录
│   │   ├── componentsExample/         # 示例页面
│   │   │   ├── index.vue
│   │   │   └── routes.js              # 页面路由
│   │   └── ...
│   ├── App.vue                        # app 的根组件
│   ├── extension.js                   # Vue 原型方法扩展
│   └── main.js                        # webpack 的入口文件
├── .env                               # 环境变量配置 无论哪个环境都会执行该文件
├── .gitignore                         # git 忽略配置文件
├── babel.config.js                    # babel 配置文件
├── package-lock.json 
├── package.json                       # npm 包配置文件
├── README.md
└── vue.config.js                      # webpack 配置文件 参考见https://cli.vuejs.org/zh/config/
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
