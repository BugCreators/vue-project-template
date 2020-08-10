/**
 * @author         { HGQ }
 * @date           { 2017-04-20 16:42 }
 */

/**
 * [ajax description]
 * @return {[type]} [description]
 *
 * UM.ajax 是从UEditor 抄来的, 这里主要用于图片上传
 *
 */
UM.ajax = function () {

  //创建一个ajaxRequest对象
  var fnStr = 'XMLHttpRequest()';
  try {
    new ActiveXObject("Msxml2.XMLHTTP");
    fnStr = 'ActiveXObject(\'Msxml2.XMLHTTP\')';
  } catch (e) {
    try {
      new ActiveXObject("Microsoft.XMLHTTP");
      fnStr = 'ActiveXObject(\'Microsoft.XMLHTTP\')'
    } catch (e) { }
  }
  var creatAjaxRequest = new Function('return new ' + fnStr);

  // *
  //  * 将json参数转化成适合ajax提交的参数列表
  //  * @param json

  function json2str(json) {
    var strArr = [];
    for (var i in json) {
      //忽略默认的几个参数
      if (i == "method" || i == "timeout" || i == "async" || i == "dataType" || i == "callback") continue;
      //忽略控制
      if (json[i] == undefined || json[i] == null) continue;
      //传递过来的对象和函数不在提交之列
      if (!((typeof json[i]).toLowerCase() == "function" || (typeof json[i]).toLowerCase() == "object")) {
        strArr.push(encodeURIComponent(i) + "=" + encodeURIComponent(json[i]));
      } else if (utils.isArray(json[i])) {
        //支持传数组内容
        for (var j = 0; j < json[i].length; j++) {
          strArr.push(encodeURIComponent(i) + "[]=" + encodeURIComponent(json[i][j]));
        }
      }
    }
    return strArr.join("&");
  }

  function doAjax(url, ajaxOptions) {
    var xhr = creatAjaxRequest(),
      //是否超时
      timeIsOut = false,
      //默认参数
      defaultAjaxOptions = {
        method: "POST",
        timeout: 5000,
        async: true,
        data: {}, //需要传递对象的话只能覆盖
        onsuccess: function () { },
        onerror: function () { }
      };

    if (typeof url === "object") {
      ajaxOptions = url;
      url = ajaxOptions.url;
    }
    if (!xhr || !url) return;
    var ajaxOpts = ajaxOptions ? utils.extend(defaultAjaxOptions, ajaxOptions) : defaultAjaxOptions;

    var submitStr = json2str(ajaxOpts); // { name:"Jim",city:"Beijing" } --> "name=Jim&city=Beijing"
    //如果用户直接通过data参数传递json对象过来，则也要将此json对象转化为字符串
    if (!utils.isEmptyObject(ajaxOpts.data)) {
      submitStr += (submitStr ? "&" : "") + json2str(ajaxOpts.data);
    }
    //超时检测
    var timerID = setTimeout(function () {
      if (xhr.readyState != 4) {
        timeIsOut = true;
        xhr.abort();
        clearTimeout(timerID);
      }
    }, ajaxOpts.timeout);

    var method = ajaxOpts.method.toUpperCase();
    var str = url + (url.indexOf("?") == -1 ? "?" : "&") + (method == "POST" ? "" : submitStr + "&noCache=" + +new Date);
    xhr.open(method, str, ajaxOpts.async);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (!timeIsOut && xhr.status == 200) {
          ajaxOpts.onsuccess(xhr);
        } else {
          ajaxOpts.onerror(xhr);
        }
      }
    };
    if (method == "POST") {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(submitStr);
    } else {
      xhr.send(null);
    }
  }

  function doJsonp(url, opts) {

    var successhandler = opts.onsuccess || function () { },
      scr = document.createElement('SCRIPT'),
      options = opts || {},
      charset = options['charset'],
      callbackField = options['jsonp'] || 'callback',
      callbackFnName,
      timeOut = options['timeOut'] || 0,
      timer,
      reg = new RegExp('(\\?|&)' + callbackField + '=([^&]*)'),
      matches;

    if (utils.isFunction(successhandler)) {
      callbackFnName = 'bd__editor__' + Math.floor(Math.random() * 2147483648).toString(36);
      window[callbackFnName] = getCallBack(0);
    } else if (utils.isString(successhandler)) {
      callbackFnName = successhandler;
    } else {
      if (matches = reg.exec(url)) {
        callbackFnName = matches[2];
      }
    }

    url = url.replace(reg, '\x241' + callbackField + '=' + callbackFnName);

    if (url.search(reg) < 0) {
      url += (url.indexOf('?') < 0 ? '?' : '&') + callbackField + '=' + callbackFnName;
    }

    var queryStr = json2str(opts); // { name:"Jim",city:"Beijing" } --> "name=Jim&city=Beijing"
    //如果用户直接通过data参数传递json对象过来，则也要将此json对象转化为字符串
    if (!utils.isEmptyObject(opts.data)) {
      queryStr += (queryStr ? "&" : "") + json2str(opts.data);
    }
    if (queryStr) {
      url = url.replace(/\?/, '?' + queryStr + '&');
    }

    scr.onerror = getCallBack(1);
    if (timeOut) {
      timer = setTimeout(getCallBack(1), timeOut);
    }
    createScriptTag(scr, url, charset);

    function createScriptTag(scr, url, charset) {
      scr.setAttribute('type', 'text/javascript');
      scr.setAttribute('defer', 'defer');
      charset && scr.setAttribute('charset', charset);
      scr.setAttribute('src', url);
      document.getElementsByTagName('head')[0].appendChild(scr);
    }

    function getCallBack(onTimeOut) {
      return function () {
        try {
          if (onTimeOut) {
            options.onerror && options.onerror();
          } else {
            try {
              clearTimeout(timer);
              successhandler.apply(window, arguments);
            } catch (e) { }
          }
        } catch (exception) {
          options.onerror && options.onerror.call(window, exception);
        } finally {
          options.oncomplete && options.oncomplete.apply(window, arguments);
          scr.parentNode && scr.parentNode.removeChild(scr);
          window[callbackFnName] = null;
          try {
            delete window[callbackFnName];
          } catch (e) { }
        }
      }
    }
  }

  return {

    request: function (url, opts) {
      if (opts && opts.dataType == 'jsonp') {
        doJsonp(url, opts);
      } else {
        doAjax(url, opts);
      }
    },
    getJSONP: function (url, data, fn) {
      var opts = {
        'data': data,
        'oncomplete': fn
      };
      doJsonp(url, opts);
    }
  };


}();

/**
 * [serializeParam description]
 * @param  {[type]} json [description]
 * @return {[type]}      [description]
 *
 * UM.utils 类 ，抄UEditor
 *
 */
var utils = UM.utils;
UM.utils.serializeParam = function (json) {
  var strArr = [];
  for (var i in json) {
    //忽略默认的几个参数
    if (i == "method" || i == "timeout" || i == "async") continue;
    //传递过来的对象和函数不在提交之列
    if (!((typeof json[i]).toLowerCase() == "function" || (typeof json[i]).toLowerCase() == "object")) {
      strArr.push(encodeURIComponent(i) + "=" + encodeURIComponent(json[i]));
    } else if (utils.isArray(json[i])) {
      //支持传数组内容
      for (var j = 0; j < json[i].length; j++) {
        strArr.push(encodeURIComponent(i) + "[]=" + encodeURIComponent(json[i][j]));
      }
    }
  }
  return strArr.join("&");
}
UM.utils.formatUrl = function (url) {
  var u = url.replace(/&&/g, '&');
  u = u.replace(/\?&/g, '?');
  u = u.replace(/&$/g, '');
  u = u.replace(/&#/g, '#');
  u = u.replace(/&+/g, '&');
  return u;
}
UM.utils.str2json = function (s) {

  if (!utils.isString(s)) return null;
  if (window.JSON) {
    return JSON.parse(s);
  } else {
    return (new Function("return " + utils.trim(s || '')))();
  }

}


// 上次base64 成url
function convertBase64ToUrl(base64Stream, cb) {
  var me = this;

  var actionUrl = me.getActionUrl('uploadscrawl'),
    params = UM.utils.serializeParam(me.queryCommandValue('serverparam')) || '',
    url = UM.utils.formatUrl(actionUrl + (actionUrl.indexOf('?') == -1 ? '?' : '&') + params);

  var opt = {};
  opt[me.getOpt('scrawlFieldName')] = base64Stream.replace(/^[^,]+,/, '');
  opt.onsuccess = function (xhr) {
    var json = UM.utils.str2json(xhr.responseText),
      url = me.options.scrawlUrlPrefix + json.url;

    typeof cb === 'function' && $.proxy(cb, me)(url);
  }
  opt.onerror = function (err) { }

  UM.ajax.request(url, opt);
}

// 获取query的值
function getQueryStrByUrl(url, name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = url.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return 0;
}

// 插入公式url
UM.Editor.prototype._insertImage = function (src, latex) {

  // var w_px = 'width:' + parseInt(getQueryStrByUrl(src, 'width') / 2) + 'px;',
  // h_px = 'height:' + parseInt(getQueryStrByUrl(src, 'height') / 2) + 'px;';
  var w_px = 'width:' + parseInt(getQueryStrByUrl(src, 'width') * 0.6) + 'px;',
    h_px = 'height:' + parseInt(getQueryStrByUrl(src, 'height') * 0.6) + 'px;';

  // var w = this.$container.width();
  this.execCommand('inserthtml', '<img class="kfformula" _src="' + src +
    '" src="' + src +
    '" data-latex="' + latex +
    '" style="' + w_px + h_px + '"/>');
}
UM.Editor.prototype._insertHtml = function (html) {
  this.execCommand('inserthtml', html);
}
UM.Editor.prototype._insertImageLoading = function (imageId) {
  var w = this.$container.width();
  this.execCommand('inserthtml', '<img id="' + imageId + '"  data-loading="loading" _src="' + this.options.themePath + '" src="' + this.options.themePath + 'default/images/loading.gif' + '" data-latex="" />'); //max-width:' + (w / 2) + 'px;
}
UM.Editor.prototype._setImageLink = function (src, imageId) {
  var image = this.$container.find('#' + imageId);
  if (image.length) {
    image.attr('src', src);
    image.attr('_src', src);
    image.removeAttr('id');
    image.removeAttr('data-loading');
  }

  image.one('load', function () {

    //         var w = $(this).width(),
    //             h = $(this).height();

    // 获取src 返回的真实图片宽高
    var w = getQueryStrByUrl(src, "width"),
      h = getQueryStrByUrl(src, "height");

    $(this).css({
      width: w + 'px',
      height: h + 'px'
    })
  })

}
//  UM.Editor.prototype.filterInputRule = function(root) {
//      root.traversal(function(el) {
//          if (el.type == 'element') {
//              if (el.tagName !== 'img') {
//                  if (el.attrs.style) {
//                      delete el.attrs.style;
//                  }
//              }
//              if (el.attrs.class) {
//                  delete el.attrs.class;
//              }
//              if ($.inArray(el.tagName, ['h1', 'h2', 'h3', 'h4', 'h5', 'div', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code']) != -1) {
//                  el.tagName = 'p';
//              }
//              if ($.inArray(el.tagName, ['small', 'span', 'strong', 'i', 'em']) != -1) {
//                  el.tagName = 'span';
//              }
//          }
//      })
//  }


if (!window.$token) {
  function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))

      return unescape(arr[2]);
    else
      return null;
  }
  window.$token = getCookie('user_token');
}
var fileIndex = 0;
UM.Editor.prototype._bkGetActionUrl = UM.Editor.prototype.getActionUrl;
UM.Editor.prototype.getActionUrl = function (action) {
  var me = this;
  fileIndex++;
  if (action == 'uploadimage') {
    // 写死先me.options.basePath
    return window.$ctx + "/ueditorFileUploadForCut.do?fileIndex=" + fileIndex + "&token=" + window.$token;
  } else if (action == 'uploadfile') {
    return window.$ctx + "/ueditorFileUpload.do?fileIndex=" + fileIndex + "&token=" + window.$token;
  } else if (action == 'uploadvideo') {
    return window.$ctx + "/ueditorFileUpload.do?fileIndex=" + fileIndex + "&token=" + window.$token;
  } else if (action == 'uploadscrawl') {
    return window.$ctx + "/base64FileUpload.do?fileIndex=" + fileIndex + "&token=" + window.$token;
  } else {
    return me._bkGetActionUrl.call(this, action);
  }
}
UM.Editor.prototype.filterInputRule = function (root) {
  var w = this.$container.width();
  root.traversal(function (el) {
    if (el.type == 'element') {
      if (el.tagName !== 'img') {
        if (el.attrs.style && el.tagName != 'u' && (el.tagName == 'span' && el.attrs.style.indexOf('dot.jpg') == -1)) {
          delete el.attrs.style;
        }
      } else {
        if (el.attrs.style) {
          el.attrs.style = el.attrs.style.replace(/(width\:\d+px\;height\:\d+px)/g, '$1');
        }
      }

      var unaccess = ['next-cursor', 'kfformula'].some(function (item) {
        return el.attrs.class && el.attrs.class.indexOf(item) != -1;
      });
      // 过滤无用的class
      if (!unaccess) {
        delete el.attrs.class;
      }
      if ($.inArray(el.tagName, ['h1', 'h2', 'h3', 'h4', 'h5', 'div', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'tr', 'thead', 'tbody']) != -1) {
        el.tagName = 'p';
      }
      if ($.inArray(el.tagName, ['small', 'font', 'td', 'th']) != -1) {
        el.tagName = 'span';
      }
      if (el.tagName == 'a') {
        if (!el.attrs._href) {
          el.attrs._href = el.attrs.href;
        }
      }
    }
  })
}

UM.registerUI('simpleupload',
  function (name) {
    var me = this;
    var id = me.$body.attr('id') + '_' + name;
    var $btn = $.eduibutton({
      icon: 'image',
      click: function () {
        return false;
      },
      mousedown: function () {
        return false;
      },
      title: this.getLang('labelMap')['image'] || ''
    });
    $btn.attr('id', id);
    setTimeout(function () {
      var uploader = WebUploader.create({
        // 选完文件后，是否自动上传。
        auto: true,
        fileVal: 'upfile',
        // swf文件路径
        swf: me.options.basePath + '/js/ueditor_utf8-jsp_1_4_3/third-party/webuploader/Uploader.swf',
        // 文件接收服务端。
        server: UM.Editor.prototype.getActionUrl('uploadimage'),
        formData: {
          // catalogId: ''
        },
        pick: {
          id: '#' + id,
          multiple: false
        },
        accept: {
          title: 'image',
          extensions: 'gif,jpg,jpeg,bmp,png',
          mimeTypes: 'image/jpg,image/jpeg,image/png'
        }
      });
      uploader.on('uploadStart', function (file) {
        me.fireEvent("simpleuploadbeforeloading");
        me._insertImageLoading(file.id);
      })
      uploader.on('uploadSuccess', function (file, response) {
        me._setImageLink(response.url, file.id);
        me.fireEvent('contentChange');
      });
      uploader.on('uploadComplete', function (file) {
        this.removeFile(file);
      })
      if ($('#' + id + '_btn').length)
        uploader.addButton({
          id: '#' + id + '_btn',
          innerHTML: ''
        });
    }, 100)
    this.addListener('selectionchange', function () {
      var state = this.queryCommandState(name);
      $btn.edui().disabled(state == -1).active(state == 1)
    });

    return $btn;
  }
);
UM.registerUI('kityformula', function (name) {
  var me = this,
    $dialog, currentRange, opt = {
      title: '插入公式',
      width: 820,
      height: 400,
      cancellabel: "取消",
      oklabel: "确定",
      backdrop: 'static',
      beforeok: true
    };
  var $btn = $.eduibutton({
    icon: 'formula',
    click: function () {
      return false;
    },
    title: this.getLang('labelMap')['formula'] || ''

  })
  $dialog = $.eduimodal(opt);
  var $iframe = $('<iframe id="kfEditorContainer' + (new Date() - 0) + '" style="border:none;height:100%;width:100%;"> </iframe>')
  $dialog.attr('id', 'edui-dialog-' + name).addClass('edui-dialog-' + name)
    .find('.edui-modal-body').addClass('edui-dialog-' + name + '-body').css({
      overflow: 'hidden'
    }).html($iframe);
  $dialog.edui().on('beforehide', function () {
    var rng = me.selection.getRange();
    if (rng.equals(currentRange)) {
      rng.select()
    }
  }).on('beforeshow', function () {
    var $root = this.root(),
      win = null,
      offset = null;
    currentRange = me.selection.getRange();

    if (!$root.parent()[0]) {
      me.$container.find('.edui-dialog-container').append($root);
    }
    //IE6下 特殊处理, 通过计算进行定位
    if ($.IE6) {

      win = {
        width: $(window).width(),
        height: $(window).height()
      };
      offset = $root.parents(".edui-toolbar")[0].getBoundingClientRect();
      $root.css({
        position: 'absolute',
        margin: 0,
        left: (win.width - $root.width()) / 2 - offset.left,
        top: 100 - offset.top
      });
    }
    UM.setWidgetBody(name, $dialog, me);
    UM.setTopEditor(me);
    $iframe.attr('src', '/static/umeditor1.2.3/dialogs/kityformula-plugin/qlKityFormulaDialog.html?_=' + (new Date() - 0));

  }).on('afterbackdrop', function () {
    this.$backdrop.css('zIndex', me.getOpt('zIndex') + 1).appendTo(me.$container.find('.edui-dialog-container'))
    $dialog.css('zIndex', me.getOpt('zIndex') + 2)
  }).on('beforeok', function () {
    var _modal = this;
    try {
      kfe.execCommand('get.image.data', function (data) {
        //上传base64
        var latex = kfe.execCommand('get.source');
        $.proxy(convertBase64ToUrl, me)(data.img, function (url) {
          this._insertImage(url, latex);
        });

        _modal.hide();
      });
      return false;
      currentRange.select()
    } catch (e) { }
  }).attachTo($btn)
  
  me.commands['kityformula'] = {
    execCommand: function (cmd) {
      $dialog.edui().show();
    }
  }

  this.addListener('selectionchange', function () {
    var state = this.queryCommandState(name);
    $btn.edui().disabled(state == -1).active(state == 1)
  });
  return $btn;
});

UM.registerUI('important', function (name) {
  var me = this;
  var $btn = $.eduibutton({
    icon: 'important',
    click: function () {
      var $modal = $(
        '<div class="insert-emphasis" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;overflow: auto;margin: 0;background: rgba(0,0,0,.5);z-index: 1003;">' +
        '  <div class= "el-dialog" style = "margin-top: 20vh; width: 620px;"> ' +
        '    <div class="el-dialog__header">' +
        '      <span class="el-dialog__title">插入重点</span>' +
        '      <button type="button" aria-label="Close" class="el-dialog__headerbtn">' +
        '        <i class="el-dialog__close el-icon el-icon-close"></i>' +
        '      </button>' +
        '    </div>' +
        '    <div class="el-dialog__body">' +
        '      <div class="content dis-flex align-center pd-b-10">' +
        '        <div class="flex-1 el-input el-input--suffix"><!---->' +
        '          <input type="text" autocomplete="off"  class="el-input__inner">' +
        '        </div>' +
        '      </div> ' +
        '      <div class="footer">' +
        '        <div class="cancel">取消</div> ' +
        '        <div class="confirm">保存</div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>');
      $('body').append($modal);
      $modal.find('.el-input__inner').focus();
      // $modal.modal();
      $modal.find('.confirm').on('click', function () {
        var text = $modal.find('input').val();
        var html = '';
        for (var i = 0, l = text.length; i < l; i++) {
          var value = text[i];
          //中文加点
          var reg = new RegExp("[\\u4E00-\\u9FFF]+|[\\w]+", "g");
          if (reg.test(value)) {
            // html += '<span style="display:inline-block;min-width:1px; background:url(' + me.options.basePath + '/js/umeditor1.2.3/themes/default/images/dot.jpg) no-repeat 0.3em 1.2em;">' + value + '</span>'
            html += '<point contenteditable="false">' + value + '</point>';

          } else {
            html += value;
          }
        }
        html += '<span>&nbsp;</span>';
        try {
          setTimeout(function () {
            if (me.hasContents()) {
              me._insertHtml(html);
            } else {
              // 添加空标签，兼容安卓客户端显示
              me.setContent("&nbsp;" + html);
            }
            me.focus(true);
            me.execCommand('removeformat');
            $modal.remove();
          }, 100)

        } catch (e) { }
        return false;

      })
      $modal.find('.el-dialog__close').on('click', function () {
        $modal.remove();
      })
      $modal.find('.cancel').on('click', function () {
        $modal.remove();
      })
      $modal.on('click', function (e) {
        // console.log(e,e.target,e.target.className)
        if (e.target.className === 'addCollectionGroup') {
          $(this).remove();
        }
      })


      return false;
    },
    title: '插入重点'
  });


  this.addListener('selectionchange', function () {
    var state = this.queryCommandState(name);
    $btn.edui().disabled(state == -1).active(state == 1)
  });
  return $btn;
});

UM.registerUI('addOption', function (name) {
  var that = this;
  var $btn = $.eduibutton({
    icon: 'addOption',
    click: function () {
      that.execCommand("insertlabel", "option");
    },
    title: '插入小题'

  })
  return $btn;
})

UM.registerUI('addQuestion', function (name) {
  var that = this;
  var $btn = $.eduibutton({
    icon: 'addOption',
    click: function () {
      that.execCommand("insertlabel", "question");
    },
    title: '插入小题'

  })
  return $btn;
})

UM.plugins["insertlabel"] = function () {
  UM.commands["insertlabel"] = {
    execCommand: function(cmd, tagName) {
      this.execCommand("insertHtml", '<sub-' + tagName + ' contenteditable="false">(1)</sub-' + tagName + '>&nbsp;');
      setTimeout(function () {
        $(this.body).find('sub-' + tagName).each(function (idx, el) {
          el.innerHTML = "(" + ( idx + 1) + ")";
        })
      }, 100)
    }
  }
}