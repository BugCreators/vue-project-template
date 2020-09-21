<template>
  <div class="subPageA">
    456
    <quill v-model="value" />
  </div>
</template>

<script>
import quill from '@components/editor'

export default {
  components: {
    quill
  },
  data() {
    return {
      value: ''
    }
  }
}
</script>
