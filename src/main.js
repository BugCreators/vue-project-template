// 浏览器兼容
import "core-js/stable";
import "regenerator-runtime/runtime";

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "./extension";

import "@styles/style.scss";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
