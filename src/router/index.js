import Vue from "vue";
import VueRouter from "vue-router";

const routes = [
  // 默认页面
  {
    path: "/",
    redirect: "nestedRoute",
  },
].concat(
  // 动态加载各模块路由，./subPages/xx/routes.js
  ...(r => {
    return r.keys().map(key => {
      return r(key).default.map(route => {
        return {
          path: route.path,
          name: route.name,
          redirect: route.redirect,
          component: route.component,
          children: route.children || [],
        };
      });
    });
  })(require.context("../views", true, /^\.(\/\w+)+\/routes\.js$/i))
);

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
});

export default router;
