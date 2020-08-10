export default [
  {
    path: "/nestedRoute",
    component: () => import("./nestedRoute.vue"),
    name: "nestedRoute",
    // 若页面有route-view 使用此项设置默认子页面
    redirect: {
      name: "subPageA",
    },
    children: [].concat(
      ...(r => {
        return r.keys().map(key => {
          return r(key).default.map(route => {
            return {
              path: route.path,
              name: route.name,
              component: route.component,
              children: route.children || [],
            };
          });
        });
      })(require.context("./subPages", true, /^\.(\/\w+)+\/route\.js$/i))
    ),
  },
];
