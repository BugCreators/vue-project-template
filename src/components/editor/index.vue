<template>
  <div class="ql-editor__wrapper">
    <div :id="id"></div>
  </div>
</template>

<script>
import QlQuill from 'ql-quill'
import 'ql-quill/dist/ql-quill.snow.css'

export default {
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
      require: true
    },
    question: {
      type: Boolean,
      default: false
    },
    option: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editor: null,
      fileIndex: 0
    }
  },
  watch: {
    value: {
      handler(value) {
        this.editor ? this.setContent(value) : this.initEditor()
      },
      immediate: true
    }
  },
  methods: {
    initEditor() {
      if (this.editor) return

      this.$nextTick(() => {
        this.editor = new QlQuill(`#${this.id}`, {
          value: this.value,
          image: {
            accept: '.jfif, .pjpeg, .jpeg, .pjp, .jpg, .png',
            action: (file, insert) => {
              this.fileIndex++

              const formData = new FormData()
              formData.append('id', `editor-image-${new Date().getTime()}`)
              formData.append('name', file.name)
              formData.append('type', file.type)
              formData.append('lastModifiedDate', file.lastModifiedDate)
              formData.append('upfile', file)
              formData.append('fileIndex', this.fileIndex)
              this.$http.uploadImage(formData).then(res => {
                if (res.state.toLowerCase() === 'success') {
                  insert(res.url)
                }
              })
            }
          },
          imageResize: true,
          import: true,
          question: this.question,
          option: this.option,
          formula: './static/kityformula-plugin/qlKityFormulaDialog.html',
          onChange: this.onChange
        })
      })
    },
    onChange(value) {
      this.$emit('input', value)
    },
    setContent(value) {
      value === this.editor.container.firstChild.innerHTML ||
        this.editor.setContent(value)
    }
  }
}
</script>

<style src="./index.scss" lang="scss"></style>