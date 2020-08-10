<template>
  <header>
    <div class="ql-header">
      <div class="ql-header-left">
        <img src="@images/components/header/logo.png" />
      </div>

      <div class="ql-header-right">
        <ul class="ql-header-nav">
          <router-link
            v-for="item in navs"
            :key="item.type"
            :to="{ name: item.type }"
            v-slot="{ href, navigate, isActive, isExactActive }"
          >
            <li
              :class="[
                isActive && 'router-link-active',
                isExactActive && 'router-link-exact-active',
              ]"
            >
              <a :href="href" @click="navigate">{{ item.name }}</a>
            </li>
          </router-link>
        </ul>
        <dropdown class="ql-header-user" ref="userDrop" :hide-timeout="250" hide-on-click>
          <span class="ql-header-user-avatar" @click="route('userInfo')">
            <img :src="avatar" @error="avatar = defalutAvatar" />
          </span>
          <dropdown-menu slot="dropdown">
            <dropdown-item @click.native="route('userInfo')">用户信息</dropdown-item>
            <dropdown-item @click.native="route('editPasswd')">修改密码</dropdown-item>
            <dropdown-item @click.native="route('editPhone')">手机绑定</dropdown-item>
            <dropdown-item @click.native="route('selectLesson')">
              <popover
                popper-class="ql-header__popover"
                placement="left-start"
                offset="10"
                trigger="hover"
              >
                <div slot="reference">选择学科</div>
                <ul class="lesson-list">
                  <li
                    v-for="(item, index) in lessonList"
                    :key="index"
                    :class="[
                      'lesson-item',
                      { 'is-active': item.lessonId === Number(lessonId) },
                    ]"
                    :title="item.lessonName"
                    @click="selectLesson(item)"
                  >
                    <i v-if="item.lessonId === Number(lessonId)" class="icon icon-ic_correct"></i>
                    <span class="lesson-name">{{ item.lessonName }}</span>
                  </li>
                </ul>
              </popover>
            </dropdown-item>
            <dropdown-item @click.native="route('relation')">关联管理</dropdown-item>
            <dropdown-item @click.native="route('exit')">退出</dropdown-item>
          </dropdown-menu>
        </dropdown>
      </div>
    </div>
  </header>
</template>

<script>
import Cookie from 'js-cookie'

import { Dropdown, DropdownMenu, DropdownItem, Popover } from 'element-ui'

export default {
  name: 'pageHeader',
  components: {
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Popover
  },
  data() {
    return {
      navs: [
        {
          type: 'nestedRoute',
          name: '模块A'
        }
      ],
      avatar: '', // 用户头像url
      defalutAvatar: require('@images/components/header/avatar.png'), // 默认头像

      lessonId: '',
      lessonList: []
    }
  },
  created() {},
  methods: {
    // 切换学科
    selectLesson(item) {
      this.lessonId = item.lessonId
    },
    route(type) {
      switch (type) {
        case 'userInfo':
          break
        case 'editPasswd':
          break
        case 'editPhone':
          break
        case 'selectLesson':
          break
        case 'relation':
          break
        case 'exit':
          let ctx = Cookie.get('$ctx')

          // 清理所有cookie
          const cookies = Cookie.get()
          const keys = Object.keys(cookies)
          if (keys.length) {
            for (let i = keys.length - 1; i >= 0; i--) {
              Cookie.remove(keys[i])
            }
          }

          Cookie.set('$ctx', ctx)

          // 重置vuex
          this.$store.commit('resetState')

          let index = window.location.pathname.indexOf('dmwork')
          let pathname = window.location.pathname.slice(0, index)

          window.location.href = window.location.origin + pathname + 'logon.do'
          break
        default:
          break
      }
    }
  }
}
</script>

<style lang="scss" src="./index.scss" scoped></style>
