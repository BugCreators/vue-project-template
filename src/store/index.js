import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// 批量导入模块
const storeFunc = require.context("./modules", true, /(index.js|common.js)/);

let modules = {};

storeFunc.keys().forEach(item => {
  const storeConfig = storeFunc(item);
  const storeName = item.replace(/\.\/|\/index.js/g, "");
  modules[storeName] = storeConfig.default || storeConfig;
});

const store = new Vuex.Store({
  mutations: {
    // 重置数据
    resetState(state) {
      for (let i in copyState) {
        state[i] = copyState[i];
      }
    },
  },
  modules,
});

// 重置数据
const copyState = deepClone(store.state); // 拷贝初始state对象
function deepClone(state) {
  let newState = state instanceof Array ? [] : {};
  for (let i in state) {
    newState[i] = typeof state[i] === "object" ? deepClone(state[i]) : state[i];
  }
  return newState;
}

export default store;
