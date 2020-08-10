// 批量导入模块化接口
const apiFiles = require.context("./modules", false, /\.js$/);

let api = {};

apiFiles.keys().forEach(item => {
  const moduleApi = apiFiles(item);
  Object.assign(api, moduleApi.default || moduleApi);
});

export default api;
