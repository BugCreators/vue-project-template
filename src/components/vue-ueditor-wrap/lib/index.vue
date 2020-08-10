<template>
  <div class="wrapper-content">
    <script :id="id" type="text/plain"></script>
  </div>
</template>

<script>
// 引入插入重点dialog样式
import { Dialog } from 'element-ui';
// import {
//   returnContent,
// } from "@/utils/config";

// 一个简单的事件订阅发布的实现,取代原始Event对象,提升IE下的兼容性
const isDev = process.env.NODE_ENV === 'development'

class LoadEvent {
  constructor() {
    this.listeners = {}
  }
  on(eventName, callback) {
    this.listeners[eventName] === undefined
      ? (this.listeners[eventName] = [])
      : ''
    this.listeners[eventName].push(callback)
  }
  emit(eventName) {
    this.listeners[eventName] &&
      this.listeners[eventName].forEach(callback => callback())
  }
}
export default {
  name: 'VueUeditorWrap',
  components: { Dialog },
  data() {
    // console.log(process.env.NODE_ENV === 'development');
    return {
      // id: 'editor' + Math.random().toString().slice(-10),
      editor: null,
      defaultConfig: {
        UMEDITOR_HOME_URL: './static/umeditor1.2.3/',
        enableAutoSave: false
      }
    }
  },
  props: {
    id: {
      type: String,
      default: () =>
        'editor' +
        Math.random()
          .toString()
          .slice(-10)
    },
    value: {
      type: String,
      default: 'Vue + UEditor + v-model双向绑定'
    },
    config: {
      type: Object,
      default: function() {
        return {}
      }
    },
    init: {
      type: Function,
      default: function() {
        return () => {}
      }
    },
    destroy: Boolean,
    plugins: {
      type: Array,
      default: () => [
        'dialogs/kityformula-plugin/qlDefaultFilter.js',
        'lang/zh-cn/zh-cn.js'
      ]
    },
    editing: Boolean,
    needAddOption: {
      type: Boolean,
      default: false
    },
    needAddQuestion: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    mixedConfig() {
      return Object.assign({}, this.defaultConfig, this.config)
    }
  },
  methods: {
    registerButton: ({ name, icon, tip, handler, UE = window.UE }) => {
      UE.registerUI(name, (editor, name) => {
        editor.registerCommand(name, {
          execCommand: () => {
            handler(editor, name)
          }
        })
        const btn = new UE.ui.Button({
          name,
          title: tip,
          cssRules: `background-image: url(${icon}) !important;background-size: cover;`,
          onclick() {
            editor.execCommand(name)
          }
        })
        editor.addListener('selectionchange', () => {
          const state = editor.queryCommandState(name)
          if (state === -1) {
            btn.setDisabled(true)
            btn.setChecked(false)
          } else {
            btn.setDisabled(false)
            btn.setChecked(state)
          }
        })
        return btn
      })
    },
    // 实例化编辑器之前-JS依赖检测
    _beforeInitEditor(value) {
      // 准确判断ueditor.config.js和ueditor.all.js均已加载 仅加载完ueditor.config.js时UE对象和UEDITOR_CONFIG对象也存在,仅加载完ueditor.all.js时UEDITOR_CONFIG对象也存在,但为空对象
      !!window.UM &&
      !!window.UMEDITOR_CONFIG &&
      Object.keys(window.UMEDITOR_CONFIG).length !== 0 &&
      !!window.UM.getEditor
        ? this._initEditor(value)
        : this._loadScripts().then(() => this._initEditor(value))
    },
    // 实例化编辑器
    _initEditor(value) {
      const that = this
      let toolbar = [
        'bold italic underline important superscript subscript removeformat',
        'simpleupload  kityformula important'
      ]
      if (this.needAddOption) {
        toolbar.push('addOption')
      }
      if (this.needAddQuestion) {
        toolbar.push('addQuestion')
      }
      this.$nextTick(() => {
        this.init()
        // 没有按官网示例那样链式调用ready方法的原因在于需要拿到getEditor返回的实例
        this.editor = window.UM.getEditor(
          this.id,
          Object.assign({}, this.mixedConfig, {
            imageUrl: UM.Editor.prototype.getActionUrl('uploadimage'),
            // basePath: window.$ctx,
            //写死先
            // basePath: isDev?'http://250.qljy.com:12999/schooldev/':window.$ctx,
            basePath: window.$ctx,
            imagePath: '',
            scrawlActionName: 'uploadscrawl',
            scrawlFieldName: 'upfile',
            scrawlUrlPrefix: '',
            toolbar,
            initialFrameHeight: 40,
            initialFrameWidth: '100%',
            autoFloatEnabled: true,
            // retainOnlyLabelPasted: true, // 粘贴只保留标签，去除标签所有属性
            // pasteplain: true,  // 是否默认为纯文本粘贴
            fontsize: [14],
            onready: function() {
              var me = this
              var root = UM.htmlparser(value)
              // var root = value;
              var html = root.toHtml()
              if (html.length) {
                me.setContent(value)
              } else {
                me.setContent('<p>&nbsp;</p>')
              }

              function setContent(_me, _con) {
                _me.execCommand('insertHtml', _con)
              }
              setTimeout(function() {
                $('.edui-btn-image input.webuploader-element-invisible')
                  .parent()
                  .css({
                    width: 20,
                    height: 20
                  })
              }, 100)

              $(window).on('scroll', function() {
                $(me.$container)
                  .find('.edui-body-container')
                  .parent()
                  .siblings('.edui-scale')
                  .hide()
              })
              $('.edui-body-container').on('scroll', function() {
                $(me.$container)
                  .find('.edui-body-container')
                  .parent()
                  .siblings('.edui-scale')
                  .hide()
              })
            }
          })
        )
        this.editor.addListener('contentChange', () => {
          // let str = this.editor.getContent()
          // this.$emit('input', returnContent(str))
          this.$emit('input', this.editor.getContent())
        })
        // fix 必须用shift+ 来输入的字符
        this.editor.addListener('keyup', () => {
          // 火狐浏览器无法删除"插入小题"的标签 需借助函数删除
          if (UM.browser.gecko) {
            const e = e || window.event
            const selectionObj = window.getSelection()
            if (e.key === 'Backspace') {
              const tagArr = ['SUB-QUESTION', 'SUB-OPTION']
              if (selectionObj.focusNode.tagName === 'P') {
                if (tagArr.includes(selectionObj.focusNode.lastChild.tagName)) {
                  $(selectionObj.focusNode.lastChild).remove()
                } else if (
                  selectionObj.focusNode.lastChild.previousSibling &&
                  tagArr.includes(
                    selectionObj.focusNode.lastChild.previousSibling.tagName
                  )
                ) {
                  $(selectionObj.focusNode.lastChild.previousSibling).remove()
                }
              } else if (selectionObj.focusNode.nodeName === '#text') {
                if (
                  selectionObj.focusNode.previousSibling &&
                  tagArr.includes(
                    selectionObj.focusNode.previousSibling.tagName
                  )
                ) {
                  if (
                    !selectionObj.focusNode.data ||
                    selectionObj.focusOffset === 0
                  ) {
                    $(selectionObj.focusNode.previousSibling).remove()
                  }
                }
              }
            }
          }
          if (this.editor.getContent() !== this.value) {
            this.$emit('input', this.editor.getContent())
          }
        })
        this.editor.addListener('mouseout', () => {
          if (this.editor.getContent() !== this.value) {
            this.$emit('input', this.editor.getContent())
          }
        })
        // this.editor.addListener('beforepaste', (o, html) => {
        //   html.html = returnContent(html.html)
        // })
        //有选项时
        if (this.needAddOption || this.needAddQuestion) {
          const tagStr = this.needAddOption
            ? 'sub-option'
            : this.needAddQuestion
            ? 'sub-question'
            : ''
          const that = this
          // 内容变化时，重新排序
          this.editor.addListener('selectionChange', function() {
            window.editor = that.editor
            $(that.editor.body)
              .find(tagStr)
              .each(function(idx, el) {
                $(el).attr('contenteditable', false)
                el.innerHTML = `(${idx + 1})`
              })
          })
        }

        // this.editor.addListener('ready', () => {
        //   this.$emit('ready', this.editor)
        //   this.editor.setContent(value)
        //   this.editor.addListener('contentChange', () => {
        //     this.$emit('input', this.editor.getContent())
        //   })
        // })

        // 将当前实例保存到window中 用于图片再编辑
        window.$editor = this.editor;
      })
    },
    // 动态添加JS依赖
    _loadScripts() {
      // 确保多个实例同时渲染时不会重复创建SCRIPT标签
      if (window.loadEnv) {
        return new Promise((resolve, reject) => {
          window.loadEnv.on('scriptsLoaded', function() {
            resolve()
          })
        })
      } else {
        window.loadEnv = new LoadEvent()
        return new Promise((resolve, reject) => {
          // 如果在其他地方只引用ueditor.all.min.js，在加载ueditor.config.js之后仍需要重新加载ueditor.all.min.js，所以必须确保ueditor.config.js已加载
          this._loadConfig()
            .then(() => this._loadCore())
            .then(() => {
              // 加载插件 cyg
              let arr
              if (this.plugins.length) {
                arr = this.plugins.map(url => {
                  return this._loadPlugin(url)
                })
                Promise.all([...arr]).then(() => {
                  window.loadEnv.emit('scriptsLoaded')
                  resolve()
                })
              } else {
                window.loadEnv.emit('scriptsLoaded')
                resolve()
              }
            })
        })
      }
    },
    _loadConfig() {
      return new Promise((resolve, reject) => {
        if (
          !!window.UMEDITOR_CONFIG &&
          Object.keys(window.UMEDITOR_CONFIG).length !== 0
        ) {
          resolve()
          return
        }
        let configScript = document.createElement('script')
        configScript.type = 'text/javascript'
        configScript.src =
          this.mixedConfig.UMEDITOR_HOME_URL + 'umeditor.config.js'
        document.getElementsByTagName('head')[0].appendChild(configScript)
        configScript.onload = function() {
          if (
            !!window.UMEDITOR_CONFIG &&
            Object.keys(window.UMEDITOR_CONFIG).length !== 0
          ) {
            resolve()
          } else {
            console &&
              console.error(
                '加载ueditor.config.js失败,请检查您的配置地址UEDITOR_HOME_URL填写是否正确!'
              )
          }
        }
      })
    },
    _loadCore() {
      return new Promise((resolve, reject) => {
        if (!!window.UM && !!window.UM.getEditor) {
          resolve()
          return
        }
        let coreScript = document.createElement('script')
        coreScript.type = 'text/javascript'
        // coreScript.src = this.mixedConfig.UMEDITOR_HOME_URL + 'umeditor.min.js'
        coreScript.src = this.mixedConfig.UMEDITOR_HOME_URL + 'umeditor.js'
        document.getElementsByTagName('head')[0].appendChild(coreScript)
        coreScript.onload = function() {
          if (!!window.UM && !!window.UM.getEditor) {
            resolve()
          } else {
            console &&
              console.error(
                '加载ueditor.all.min.js失败,请检查您的配置地址UEDITOR_HOME_URL填写是否正确!'
              )
          }
        }
      })
    },

    // 加载插件 cyg
    _loadPlugin(url) {
      return new Promise((resolve, reject) => {
        let coreScript = document.createElement('script')
        coreScript.type = 'text/javascript'
        coreScript.src = this.mixedConfig.UMEDITOR_HOME_URL + url
        document.getElementsByTagName('head')[0].appendChild(coreScript)
        coreScript.onload = function() {
          if (!!window.UM && !!window.UM.getEditor) {
            resolve()
          } else {
            console &&
              console.error(
                '加载插件' + url + '失败,请检查您的配置地址填写是否正确!'
              )
          }
        }
      })
    },

    // 设置内容
    _setContent(value) {
      value === this.editor.getContent() || this.editor.setContent(value)
    }
  },
  beforeDestroy() {
    // if (this.destroy && this.editor && this.editor.destroy) this.editor.destroy()
    // this.editor.destroy()
    // this.editor = null
  },
  created() {},
  // v-model语法糖实现
  watch: {
    value: {
      handler(value) {
        this.editor ? this._setContent(value) : this._beforeInitEditor(value)
      },
      immediate: true
    },
    editing: {
      handler(value) {
        // 同一页面多个编辑框时 更新$editor的值为进入编辑状态的编辑器实例
        // 用于图片再编辑
        if (value) window.$editor = this.editor
      },
      immediate: true
    }
  }
}
</script>
<style lang="scss">
input[type='file'] {
  display: none;
}
.edui-container * {
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}
.edui-container *:before,
.edui-container *:after {
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}
.edui-container {
  width: 100% !important;
  box-sizing: border-box;
  .edui-body-container {
    width: 100% !important;
    box-sizing: border-box;
    // font-size: 14px !important;
    // font-family: "MicroSoft YaHei" !important;
  }
  /* 全选去除样式，行距边大，有蓝色边框问题 */
  .edui-editor-body > div[contenteditable='true'] {
    padding: 5px 10px;
    z-index: 999;
    min-height: 40px;
    outline: 0;
    box-sizing: border-box;
    p {
      margin-bottom: 0;
    }
  }
}
</style>
