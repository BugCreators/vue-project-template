<template>
  <div id="app">
    <page-header></page-header>
    <router-view></router-view>
  </div>
</template>

<script>
import PageHeader from '@/components/header'

export default {
  name: 'App',
  components: {
    PageHeader
  }
}
</script>
