import axios from "axios";
import qs from "qs";
import Cookie from "js-cookie";
import { Message } from "element-ui";

//重构分模块进行 baseURL和token需要配置
if (process.env.NODE_ENV == "development") {
  window.$ctx = "http://192.168.4.3:9999/schooldev/";
  window.$token = "DEF7A40DD939A8782DEC5D25A79267A4";
} else {
  window.$ctx = Cookie.get("$ctx");
  window.$token = Cookie.get("$token");
}
// axios配置
axios.defaults.baseURL = window.$ctx;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

//post传参序列化
axios.interceptors.request.use(
  config => {
    let token = window.$token;
    switch (config.method) {
      case "post":
        if (config.data.constructor !== FormData) {
          config.data = config.data || {};
          config.data.token = token;
          config.data = qs.stringify(config.data, { arrayFormat: "repeat" });
        } else {
          config.url += `?token=${token}`
        }
        break;
      case "get":
        config.params = config.data;
        config.params.token = token;
        delete config.data;
        break;
      default:
        break;
    }

    return config;
  },
  error => {}
);

//返回状态判断
axios.interceptors.response.use(
  res => {
    if (res.data.status) {
      Message.closeAll();
      res.data.msg && Message.error(res.data.msg);
    }

    return res.data;
  },
  error => {
    //404等问题可以在这里处理
  }
);
export default axios;
