/**
 * @file vue原型属性/方法注入
 * 在组件中调用: this.xxx
 */
import Vue from "vue";

import api from "./assets/js/http/api";
import { MessageBox, Message } from "element-ui";

Vue.prototype.$http = api;

/**
 * @desc 弹框
 * 详细配置见https://element.eleme.cn/#/zh-CN/component/message-box
 */
Vue.prototype.$msgbox = MessageBox;

/**
 * @desc 消息提示
 * @example this.$message.success("xxx");
 * 详细配置见https://element.eleme.cn/#/zh-CN/component/message
 */
Vue.prototype.$message = Message;
