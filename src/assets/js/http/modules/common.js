/**
 * @file 公共接口
 */
import http from "../http";

export default {
  /**
   * @desc 上传图片
   * @param {String} id 唯一标识id
   * @param {String} name 名字
   * @param {String} type 图片类型
   * @param {String} lastModifiedDate 编辑时间
   * @param {File} upfile 文件
   * @param {String} fileIndex 下标
   */
  uploadImage: data => {
    return http({
      url: "/ueditorFileUploadForCut.do",
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
};
