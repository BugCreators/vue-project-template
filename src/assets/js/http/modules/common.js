/**
 * @file 公共接口
 */
import http from "../http";

export default {
  /**
   * @desc 登录
   * @param { j_username } 用户名
   * @param { j_password } 密码
   * @param { isAppLogon } //web请求登录接口需要加上此参数，区分其他端 值为true
   **/
  examplePost: data => {
    return http({
      url: "/sectionLesson/sectionList.do",
      method: "post",
      data,
    });
  },
  /**
   * @desc 登录
   * @param { j_username } 用户名
   * @param { j_password } 密码
   * @param { isAppLogon } //web请求登录接口需要加上此参数，区分其他端 值为true
   **/
  exampleGet: data => {
    return http({
      url: "/sectionLesson/sectionList.do",
      method: "get",
      data,
    });
  },
  uploadimage: data => {
    return http({
      url: "/sectionLesson/sectionList.do",
      method: "get",
      data,
    });
  },
};
