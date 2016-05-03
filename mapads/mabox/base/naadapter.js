;/*!/static/js/libs/NativeAdapter.js*/
/**
 * nativeAppAdapter: ios、android客户端适配器
 * by zhanglei55
 */
;
(function(window, document, navigator, location) {

    /****************************************************************************************************
     * nativeAppAdapter基础核心内容
     ****************************************************************************************************/

    var nativeAppAdapter = {};
    /****************************************************************************************************
     * nativeAppAdapter工具类、string增强
     ****************************************************************************************************/

    var util = {};
    /**
     *  string 操作增强trim , startWith, endWith
     */
    util.trim = (function() {
        var trimReg = /(^\s*)|(\s*$)/g;
        return function(s) {
            if (!s || (typeof s !== "string")) {
                return s;
            }
            return s.replace(trimReg, '');
        }
    })();

    util.startWith = function(str, startStr) {
        if (!str || !startStr || str.length == 0 || (startStr.length > str.length))
            return false;
        if (str.substr(0, startStr.length) == startStr)
            return true;
        else
            return false;
    };
    util.endWith = function(str, endStr) {
        if (!str || !endStr || str.length == 0 || (endStr.length > str.length))
            return false;
        if (str.substr(str.length - endStr.length) == endStr)
            return true;
        else
            return false;
    };

    /**
     * type check
     */
    util.isBlank = function(obj) {
        return (obj === undefined || obj === null || util.trim(obj) === "");
    };

    util.isNull = function(o) {
        return (!o && (o !== false) && (o !== 0));
    };

    /**
     * 获取一个object的真实类型，如function(){}就是Function、{}是Object
     */
    util.objectType = (function() {
        var objectTypeReg = /^\[object (.*)\]$/;
        return function(obj) {
            if (typeof obj == "object" || typeof obj == "function") {
                return Object.prototype.toString.call(obj).match(objectTypeReg)[1];
            } else {
                return undefined;
            }
        }
    })();

    /**
     * nativeAppAdapter内部使用的次数函数
     */
    util.internalUnique = (function() {
        var time = 0;
        return function() {
            return ++time;
        }
    })();
    /**
     * unique，计数器,每次叠加一
     */
    util.unique = (function() {
        var time = 0;
        return function() {
            return ++time;
        }
    })();

    /**
     * 获取script脚本
     * @param url: script url or a object{url,success,error,timeout}
     * @param sucess: onload callback
     * @param error: onerror callback
     * @param timeout: millisecond && type: number
     * @param onetime: 请求结束后是否删除该script标签
     * @param notime: 不携带时间戳
     */
    util.getScript = function(url, success, error, timeout, onetime, notime) {
        if (util.objectType(url) == "Object") {
            success = url.success;
            error = url.error;
            timeout = url.timeout;
            onetime = url.onetime;
            notime = url.notime;
            url = url.url;
        }
        var script = document.createElement('script'),
            resulted = false,
            onload = function() {
                if (resulted) {
                    return;
                }
                resulted = true;
                if (util.objectType(success) == "Function") {
                    success.call(window);
                }
                if (onetime) {
                    script.removeEventListener("load", onload);
                    script.removeEventListener("error", onerror);
                    document.body.removeChild(script);
                }
            },
            onerror = function() {
                if (resulted) {
                    return;
                }
                resulted = true;
                if (util.objectType(error) == "Function") {
                    error.call(window);
                }
                script.removeEventListener("load", onload);
                script.removeEventListener("error", onerror);
                document.body.removeChild(script);
            };

        script.addEventListener("load", onload);
        script.addEventListener("error", onerror);
        if (!notime) {
            url = util.appendParam(url, "_naat=" + util.internalUnique());
        }
        script.setAttribute('src', url);
        document.body.appendChild(script);

        if (timeout) {
            setTimeout(function() {
                onerror.call(window);
            }, timeout);
        }
    };

    /**
     * jsonp method
     * @type {RegExp}
     */
    util.getJsonp = function(url, data, success, error, timeout, notime) {
        if (util.objectType(url) == "Object") {
            data = url.data;
            success = url.success;
            error = url.error;
            timeout = url.timeout;
            notime = url.notime;
            url = url.url;
        }
        url = util.appendParam(url, data);
        url = util.appendCallback(url, success);
        util.getScript(url, undefined, error, timeout || 5000, true, notime);
    };

    /**
     * 向url追加参数，处理向url添加参数?和&的问题
     * param: string or object
     */
    util.appendParam = function(url, param) {
        if (util.isNull(param)) {
            return url;
        }
        if (util.objectType(param) == "Object") {
            param = util.stringifyObject(param);
        }
        if (!url) {
            url = "";
        }
        if (util.endWith(url, "?")) {
            url += param;
        } else if (util.endWith(url, "&")) {
            if (url.indexOf("?") >= 0) {
                url += param;
            } else {
                url += "?" + param;
            }
        } else {
            if (url.indexOf("?") >= 0) {
                url += "&" + param;
            } else {
                url += "?" + param;
            }
        }
        return url;
    };

    /**
     * 向url添加callback
     */
    util.appendCallback = (function() {
        var callbackReg = /(&|\?)callback=([^&]*)?(&|$)/g;
        return function(url, fn) {
            if ((util.objectType(fn) != "Function") || util.isBlank(url)) {
                throw new Error("callback function should be a function and url can't be blank.");
            }
            var callbackName = "naaInternalCallback" + util.internalUnique();
            window[callbackName] = function(data) {
                fn.call(window, data);
                delete window[callbackName];
            }
            var result = url;
            //callback
            if (url.search(callbackReg) >= 0) {
                result = url.replace(callbackReg, function(match, begin, value, end) {
                    return begin + "callback=" + callbackName + end;
                });
            } else {
                result = util.appendParam(url, "callback=" + callbackName);
            }

            return result;
        }
    })();

    /**
     * convert Object to "a=1&b=2" liked String
     * @param obj
     * @returns "a=1&b=2" liked
     */
    util.stringifyObject = function(obj) {
        if (util.objectType(obj) !== "Object") {
            if (util.isBlank(obj) || (typeof obj !== "string")) {
                return "";
            }
            return obj;
        }
        var r = "";
        util.hasOwn(obj, function(key, value) {
            r += "&" + key + "=" + encodeURIComponent(value);
        });
        return r.substr(1);
    };

    /**
     * convert "a=1&b=2" liked String to Object
     * @param obj
     * @returns {*}
     */
    util.parseStringifiedObject = function(str) {
        if (typeof str !== "string") {
            if (typeof str == "object") {
                return str;
            }
            return {};
        }

        var r = {},
            strArr = str.split("&"),
            len = strArr.length,
            i, t, p, k, v;
        for (i = 0; i < len; i++) {
            t = strArr[i];
            p = t.indexOf("=");
            if (p <= 0) {
                continue;
            }
            k = t.substring(0, p);
            v = decodeURIComponent(t.substr(p + 1));
            r[k] = v;
        }

        return r;
    };

    /**
     *遍历对象的所有自有属性，执行回调函数fn(key,value)
     */
    util.hasOwn = function(obj, fn) {
        var k, v;
        for (k in obj) {
            if (obj.hasOwnProperty(k)) {
                v = obj[k];
                fn && (fn.call(window, k, v));
            }
        }
    };

    /**
     * 创建一个iframe请求
     */
    util.makeIframeRequest = function(url, notime) {
        var iframe = document.createElement('iframe');
        iframe.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:0;height:0";
        iframe.id = "naaIframeRequest" + util.internalUnique();
        iframe.setAttribute('src', util.appendParam(url, notime ? "" : ("_naat=" + util.internalUnique())));
        document.body.appendChild(iframe);
        setTimeout(function() {
            document.body.removeChild(iframe);
        }, 100);
    };

    /**
     * 创建一个a标签请求
     */
    util.makeAnchorRequest = function(url, notime) {
        var a = document.createElement('a');
        a.style.cssText = "position:absolute;top:-9999px;left:-9999px;"
        a.id = "naaAnchorRequest" + util.internalUnique();
        a.setAttribute('href', util.appendParam(url, notime ? "" : ("_naat=" + util.internalUnique())));
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
        }, 100);
    };

    /***
     *  url过滤，目前过滤字段为BDUSS、cuid
     * @param url
     * @param paramsArr: 默认是：['BDUSS', 'cuid']
     * @returns {*}
     */
    util.filterUrl = function(url, paramsArr) {
        if (util.objectType(paramsArr) != "Array") {
            paramsArr = ['BDUSS', 'cuid'];
        }

        paramsArr.forEach(function(type) {
            var reg = new RegExp("[&]*" + type + "=([^&]*)", "ig");
            url = url.replace(reg, '');
        });
        return url;
    };

    //比较两个版本号的大小
    util.compareSv = function(sv1, sv2) {
        if (!sv1 || !sv2 || (typeof sv1 != "string") || (typeof sv2 != "string")) {
            throw new Error("sv should be a string");
        }

        var sv1s = sv1.split("."),
            sv2s = sv2.split("."),
            s1len = sv1s.length,
            s2len = sv2s.length,
            minlen = Math.min(s1len, s2len),
            i, s1, s2;
        for (i = 0; i < minlen; i++) {
            s1 = parseInt(sv1s[i]);
            s2 = parseInt(sv2s[i]);
            if (s1 < s2) {
                return -1;
            }
            if (s1 > s2) {
                return 1;
            }
        }

        if (s1len > s2len) {
            return 1;
        } else if (s1len < s2len) {
            return -1;
        } else {
            return 0;
        }
    };
    
    nativeAppAdapter['util'] = util;
    //放置一些util方法到nativeAppAdapter上
    ["trim", "startWith", "endWith", "isBlank", "isNull", "unique", "compareSv", "filterUrl", "getJsonp"].forEach(function(e) {
        nativeAppAdapter[e] = util[e];
    });
    /****************************************************************************************************
     * 封装经常使用的平台判断
     ****************************************************************************************************/

    var plat = (function() {
        var res = {},
            ua = navigator.userAgent,
            mobileReg = /android|webos|ip(hone|ad|od)|opera (mini|mobi|tablet)|iemobile|windows.+(phone|touch)|mobile|fennec|kindle (Fire)|Silk|maemo|blackberry|playbook|bb10\; (touch|kbd)|Symbian(OS)|Ubuntu Touch/i,
            iosReg = /ip(hone|ad|od)/i;
        if (!ua) {
            ua = "";
        }
        ua = ua.toLowerCase();
        res.isAndroid = ua.indexOf("android") > -1;
        res.isIos = iosReg.test(ua);
        res.isWeixin = ua.indexOf("micromessenger") > -1;
        res.isWeibo = ua.indexOf("weibo") > -1;
        res.isNull = util.isBlank(ua);
        //res.isWins = ua.indexOf("windows") > -1;
        //res.isMac = ua.indexOf("macintosh") > -1;
        res.isMobile = mobileReg.test(ua) || res.isNull;
        res.isPc = !res.isMobile;
        // 只有7.0.0版本以上，给userAgent做了特殊处理，才返回true。经过导航组件的web页面，有时候会莫名的丢失ua，不确定ua是什么形式。
        var isNative = (ua.indexOf("baidumap_andr") > -1) || (ua.indexOf("baidumap_ipho") > -1 || (ua.indexOf("baidumap_ipad") > -1));
        res.isNative = !res.isWeibo && !res.isWeixin && (isNative || res.isNull);
        return res;
    }());

    nativeAppAdapter.plat = plat;
    /****************************************************************************************************
     * location.search的解析
     ****************************************************************************************************/

    var query = (function() {
        var queryStr = location.search;
        if (queryStr.length > 0) {
            queryStr = queryStr.substr(1);
        }
        return util.parseStringifiedObject(queryStr);
    })();

    nativeAppAdapter.query = query;
    /****************************************************************************************************
     * 封装常用的bdapi、baidumap等协议
     ****************************************************************************************************/

    /**
     * openApi接口
     * @param url
     * @param data
     */
    nativeAppAdapter.openBaiduMap = function(url, data) {
        url = util.appendParam(url, data);
        if (plat.isAndroid) {
            util.makeIframeRequest(url, true);
        } else {
            util.makeAnchorRequest(url, true);
        }
    };

    /**
     * bdapi接口
     * @param url
     * @param data
     * @param success
     */
    nativeAppAdapter.requestBdApi = function(url, data, success) {
        if (util.objectType(data) == "Function") {
            success = data;
            data = {};
        }
        url = util.appendParam(url, data);
        if (util.objectType(success) == "Function") {
            url = util.appendCallback(url, success);
        };
        util.makeIframeRequest(url, true);
    };

    // 登录成功后，将登录状态写入到客户端
    nativeAppAdapter.writeLoginStatusToNative = function() {
        if (plat.isNative) {
            nativeAppAdapter.requestBdApi('bdapi://wappass_login.sync');
        }
    };

    /**
     * 使用端浏览器打开，协议"baidumap://map/cost_share",默认位置强关联, ios8.8.0新增"needLocation=yes"才能获取定位
     * @param url: string
     * @param needLocation: boolean
     */
    nativeAppAdapter.openInMap = function(url, needLocation) {
        if (needLocation === undefined) {
            needLocation = true;
        }
        var data = {
            url: url
        };
        if (needLocation) {
            data.needLocation = 'yes';
        }
        if (query.sharecallbackflag) {
            data.sharecallbackflag = query.sharecallbackflag;
        }
        nativeAppAdapter.openBaiduMap("baidumap://map/cost_share", data);
    };

    /**
     * 8.8.0新增的api，获取地图里的信息，本身接口返回的是string型的json串，这里做一下封装
     * @param callback:
     *  data {
     *  {
     *      "loc_x": "12948043",
     *      "loc_y": "4845095",
     *      "c": "131",
     *      "cuid": "2827418F1F6639B6E8506FF439FB7343|599773260074553",
     *      "os": "Android22",
     *      "mb": "Nexus 6",
     *      "ov": "Android22",
     *      "sv": "8.8.0",
     *      "bduss": "",
     *      "xdpi": "494",
     *      "ydpi": "492",
     *      "net": "1",
     *      "ua": " baidumap_ANDR"
     *   }
     */
    nativeAppAdapter.getNativeInfo = function(callback) {
        var tmpCallback = function(dataStr) {
            var data = JSON.parse(dataStr);
            if (util.objectType(callback) == "Function") {
                callback.call(window, data);
            }
        }

        nativeAppAdapter.requestBdApi("bdapi://getNativeInfo", tmpCallback);
    };
    /****************************************************************************************************
     * 地图客户端分享+微信分享+浏览器微博分享封装
     ****************************************************************************************************/

    /**
     * 调用native接口，调起分享到微博、微信的弹出选框
     * 在这种情况下分享到微博或微信只用在页面中做一个按钮，点击这个按钮后由客户端从底部弹起遮罩层，在层中有具体分享到各个社交平台的按钮
     * see：http://wiki.babel.baidu.com/twiki/bin/view/Ps/Ns/ShareCost
     * @param optionsArr: array类型, [{weibo},{weixin},{friend}]
     * @param initMapShare: boolean, 选择行为是设置右上角内容或者调起分享组件
     */
    nativeAppAdapter.mapShare = function(optionsArr, initMapShare) {
        if (!plat.isNative) {
            return null;
        }

        var httpReg = /http:\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{3}/,
            nativeUrlArr = [],
            shareBdApiUrl = initMapShare ? 'bdapi://setShareContent?' : 'bdapi://openSharePrompt?';

        // check loop
        optionsArr.forEach(function(e) {
            var formattedObj = {},
                title = undefined,
                content = undefined,
                contentType = undefined;
            if (e.hasOwnProperty('src')) {
                var src = e.src;
                switch (src) {
                    case "weibo":
                    case "sina_weibo":
                        formattedObj.shareTo = "sina_weibo";
                        //weibo need add url to text(content)
                        content = e.text + e.url;
                        contentType = "text";
                        break;
                    case "weixin":
                        formattedObj.shareTo = "weixin";
                        content = e.text;
                        break;
                    case "friend":
                    case "weixin_friend":
                        formattedObj.shareTo = "weixin_friend";
                        title = e.text;
                        break;
                    default:
                        throw new Error("分享参数不对！");
                }
                //formattedObj.url = util.filterUrl(e.url);
                formattedObj.url = e.url;
                formattedObj.title = title ? title : (e.title ? e.title : "分享百度地图");
                formattedObj.content = content;
                formattedObj.contentType = contentType ? contentType : (e.contentType ? e.contentType : "text");
                // pic -> imageSource
                //  http://xxxxxxx.png 某个具体url
                //  icon 百度地图的小图标
                //  capture_screen 截图，目前客户端已至此，我们暂时用不上，前端js组件暂未支持
                formattedObj.imageSource = (e.pic && httpReg.test(e.pic)) ? e.pic : "icon";
            }
            nativeUrlArr.push(formattedObj);
        })

        if (nativeUrlArr.length) {
            shareBdApiUrl += encodeURIComponent(JSON.stringify({
                shareList: nativeUrlArr
            }));
        }
        nativeAppAdapter.requestBdApi(shareBdApiUrl);
    };

    /**
     * 新浪weibo分享
     * @param opts:
     *      title [类型String] 分享内容，无需encodeURI
     *      url [类型String] 分享链接，无需encodeURI
     *      pic [类型String] 分享图片的url，无需encodeURI。新浪的接口多张图片尚未完全开放，暂时只能分享一张
     *      ralateUid [类型String 或 Number] 相关微博Uid，如果有此项，分享内容会自动 @相关微博
     *      appkey [类型String 或 Number] 分享来源的appkey，如果有此项，会在微博正文地下，显示“来自XXX”
     */
    nativeAppAdapter.weiboShare = function(opts) {
        var sinaUrl = "http://service.weibo.com/share/" + (plat.isMobile ? "mobile" : "share") + ".php";
        sinaUrl = util.appendParam(sinaUrl, opts);
        try {
            window.open(sinaUrl)
        } catch (e) {}
    };

    /**
     * 微信weixin分享
     * @param optionsArr: array类型, [{weibo},{weixin},{friend}]
     * @param callbackOptions: 回调类型
     */
    nativeAppAdapter.weixinShare = (function() {
        // 微信api的参数
        var appId, timestamp, nonceStr, signature,
        // 分享内容选项
            timelineOpt, friendOpt, weiboOpt,
            weixinApiReady = false,
        // config失败，尝试次数
            tryConfigTime = 0,
            maxTryConfigTime = 5,
            weixinApiUrl = 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js',
            jsApiList = [
                // 所有要调用的 API 都要加到这个列表中
                'onMenuShareTimeline', // 朋友圈
                'onMenuShareAppMessage', // 分享好友
                'onMenuShareWeibo',
            ],
            onError = {};

        /**
         * opt增加初始化失败回调，一共有三种情况：
         *     1： getScript拉weixinApi失败,onloadError
         *     2： getJsonp请求失败, onInitError
         *     3： config失败， onConfigError
         */
        return function(optionsArr, callbackOptions) {

            if (!plat.isWeixin)
                return;

            // 过滤选项
            optionsArr.forEach(function(e) {
                if (e.hasOwnProperty('src')) {
                    var src = e.src;
                    switch (src) {
                        case "weibo":
                        case "sina_weibo":
                            weiboOpt = e;
                            break;
                        case "weixin":
                            friendOpt = e;
                            break;
                        case "friend":
                        case "weixin_friend":
                            timelineOpt = e;
                            break;
                        default:
                            throw new Error("分享参数不对！");
                    }
                }
            });

            onError = util.objectType(callbackOptions) == "Object" ? callbackOptions : {};

            onError.loadError = onError.loadError || function() {};
            onError.initError = onError.initError || function() {};
            onError.configError = onError.configError || function() {};

            // 先拉取weixinApi
            if ('wx' in window) {
                if (weixinApiReady) {
                    setWeixinOptions();
                } else {
                    initWeixinApi(setWeixinOptions);
                }
            } else {
                util.getScript(weixinApiUrl, function() {
                    initWeixinApi(setWeixinOptions);
                }, onError.loadError);
            }
        };

        function initWeixinApi(callback) {

            // 然后拉取token
            // getJsonp('http://172.22.97.126/weixin/sample/php/test.php?url=' + location.href.split('#')[0] + '&callback=?', function (data) {
            util.getJsonp('http://zt.baidu.com/weixin/ticket?url=' + encodeURIComponent(location.href.split('#')[0]) + '&callback=?', {}, function(data) {
                    // getJsonp('http://cq01-rdqa-dev038.cq01.baidu.com:8003/weixin/ticket?url=' + encodeURIComponent(location.href.split('#')[0]) + '&callback=?', function (data) {
                    if (data && data.errno === 0) {
                        appId = data.data.appId;
                        timestamp = data.data.timestamp;
                        nonceStr = data.data.nonceStr;
                        signature = data.data.signature;
                        // console.log(data.data);
                        // alert(JSON.stringify(data.data));
                        wx.config({
                            debug: false,
                            appId: data.data.appId,
                            timestamp: data.data.timestamp,
                            nonceStr: data.data.nonceStr,
                            signature: data.data.signature,
                            jsApiList: jsApiList
                        });

                        // config验证通过后，会执行wx.ready，将验证通过标识放入回调
                        // weixinApiReady = true;

                        callback && callback();
                    }
                },
                // error callback
                onError.initError);
        };

        function setWeixinOptions() {
            //设置微信分享成功
            wx.ready(function() {
                // alert("config succeed");
                // 验证通过标识
                weixinApiReady = true;

                // alert("initoption");
                // 朋友圈
                wx.onMenuShareTimeline({
                    title: timelineOpt.text, // 分享标题
                    link: timelineOpt.url, // 分享链接
                    imgUrl: timelineOpt.pic, // 分享图标
                    success: function() {
                        // 用户确认分享后执行的回调函数
                        timelineOpt.confirm && timelineOpt.confirm();
                    },
                    cancel: function() {
                        // 用户取消分享后执行的回调函数
                        timelineOpt.cancel && timelineOpt.cancel();
                    }
                });

                // 好友
                wx.onMenuShareAppMessage({
                    title: friendOpt.title, // 分享标题
                    desc: friendOpt.text, // 分享描述
                    link: friendOpt.url, // 分享链接
                    imgUrl: friendOpt.pic, // 分享图标
                    type: 'link', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function() {
                        // 用户确认分享后执行的回调函数
                        friendOpt.confirm && friendOpt.confirm();
                    },
                    cancel: function() {
                        // 用户取消分享后执行的回调函数
                        friendOpt.cancel && friendOpt.cancel();
                    }
                });

                // 微博
                wx.onMenuShareWeibo({
                    title: '', // 分享标题
                    desc: weiboOpt.text, // 分享描述
                    link: weiboOpt.url, // 分享链接
                    imgUrl: weiboOpt.pic, // 分享图标
                    success: function() {
                        // 用户确认分享后执行的回调函数
                        weiboOpt.confirm && weiboOpt.confirm();
                    },
                    cancel: function() {
                        // 用户取消分享后执行的回调函数
                        weiboOpt.cancel && weiboOpt.cancel();
                    }
                });
            });
            //设置微信分享失败
            wx.error(function() {
                tryConfigTime++;
                if (tryConfigTime > maxTryConfigTime) {
                    tryConfigTime = 0;
                    onError.configError && onError.configError();
                    return;
                }

                initWeixinApi(setWeixinOptions);
            });
        };
    })();

    /**
     * 初始化微信分享、地图端分享
     * @param optionsArr: object or array
     *          object: {title, text, url, weiboPic, weixinPic}
     *          array: [{src:"weibo",text,url,contentType:"text",pic,confirm,cancal},{src:"weixin",title,text,url,contentType:"text",pic,confirm,cancal},{src:"friend",text,url,contentType,pic,confirm,cancal}]
     *          其中confirm,cancal为微信中分享成功、失败的回调
     * @param weixinCallbacks:object 初始化微信接口回调
     *          {loadError:加载微信apijs出错,initError:初始化微信接口出错,configError:配置微信接口出错}
     */
    var _smartShare = (function() {
        var savedOptionsArr, savedWeixinCallbacks;
        return function(optionsArr, weixinCallbacks, inited) {
            if (!inited) {
                if (util.objectType(optionsArr) == "Object") {
                    savedOptionsArr = [];
                    savedOptionsArr.push({
                        src: "weibo",
                        text: optionsArr.text,
                        url: optionsArr.url,
                        pic: optionsArr.weiboPic || optionsArr.weibopic,
                        contentType: "text"
                    });
                    savedOptionsArr.push({
                        src: "weixin",
                        title: optionsArr.title,
                        text: optionsArr.text,
                        url: optionsArr.url,
                        pic: optionsArr.weixinPic || optionsArr.weixinpic,
                        contentType: "text"
                    });
                    savedOptionsArr.push({
                        src: "friend",
                        text: optionsArr.text,
                        url: optionsArr.url,
                        pic: optionsArr.weixinPic || optionsArr.weixinpic,
                        contentType: "text"
                    });
                } else {
                    savedOptionsArr = optionsArr;
                }

                //savedOptionsArr.forEach(function(e) {
                //    e.url = util.filterUrl(e.url);
                //});

                savedWeixinCallbacks = weixinCallbacks;
                //初始化地图端右上角分享
                if (plat.isNative) {
                    nativeAppAdapter.mapShare(savedOptionsArr, true);
                }
                //初始化微信端右上角分享
                if (plat.isWeixin) {
                    nativeAppAdapter.weixinShare(savedOptionsArr, savedWeixinCallbacks);
                }
            } else {
                if (savedOptionsArr) {
                    if (plat.isNative) {
                        //打开地图组件
                        nativeAppAdapter.mapShare(savedOptionsArr, false);
                    } else {
                        //分享到微博
                        savedOptionsArr.some(function(e) {
                            if (e.hasOwnProperty('src') && (e.src == 'weibo' || e.src == 'sina_weibo')) {
                                nativeAppAdapter.weiboShare({
                                    title: e.text,
                                    url: e.url,
                                    pic: e.pic
                                });
                            }
                        });
                    }
                }
            }
        }
    })();

    /**
     * 初始化微信分享、地图端分享
     * @param optionsArr：同上
     * @param weixinCallbacks：同上
     */
    nativeAppAdapter.initShare = function(optionsArr, weixinCallbacks) {
        _smartShare(optionsArr, weixinCallbacks, false);
    };

    /**
     * 打开地图客户端组件
     */
    nativeAppAdapter.openShare = function() {
        _smartShare(undefined, undefined, true);
    };
    /****************************************************************************************************
     * 封装运营常见的一些服务
     * http://man.baidu.com/app/search/lbs-webapp/operation/odp/webroot/sign/
     ****************************************************************************************************/

    /**
     * 用户登录状态检查
     * @param callback: ###http://man.baidu.com/app/search/lbs-webapp/operation/odp/webroot/sign/#接口_用户登录状态检查
     * @param picType:头像类型,portrait(110*110)、portraitn(55*55)、portraitl(480*480)、portraith(960*960)、portraitm(150*150)
     * @returns {*}
     * {
     *     "errno": 0,       //0代表已登录，1代表未登录, 2代表 referer 校验不通过
     *     "errmsg": ""
     *     "result" : {
     *       "uid": 310000849,
     *       "displayname": "中文名测1", //displayname 一定非空，显示顺序：昵称，打码后的手机号，打码后的邮箱，uid
     *       "pic": "http://himg.bdimg.com/sys/portrait/item/ee5b1f0b" //用户头像的url，若用户未上传过头像，返回为空
     *     }
     * }
     *
     */
    nativeAppAdapter.getLoginStatus = function(callback, picType) {
        picType = picType || "portrait";
        if (util.objectType(callback) == "Function") {
            util.getJsonp("http://map.baidu.com/opn/service/checkuser", {
                pic: picType
            }, callback);
        }
        return nativeAppAdapter;
    };

    /**
     * 转向登录
     * ###http://docs.babel.baidu.com/doc/e0cac942-5841-4f75-8787-21c1d4a10a2a
     * @param param {
     *  tpl: 产品线(默认ma:地图),
     *  authsite:是否展示第三方登录，1:展示，0:不展示，默认(0)
     * }
     */
    nativeAppAdapter.gotoLogin = function(param) {
        var loginUrl = "http://wappass.baidu.com/passport/?",
            data = {};
        param = param || {};
        data.tpl = param.tpl || "ma";
        data.authsite = param.autosite ? 1 : 0;
        data.u = location.href;

        loginUrl = util.appendParam(loginUrl, data);
        location.href = loginUrl;
    };

    /**
     * 获取城市id，城市名
     * 通过回调函数的方式获取当前城市和城市所在省。
     * 首先通过客户端传参获取城市id；没有或不在常用城市列表中则调用http://api.map.baidu.com/location/ip的接口
     * @param callback 成功后的回调
     *  {
     *       province: 省名,
     *       name: 城市名,
     *       id: 城市id(不一定有),
     *       otherData: 后端接口返回的全部信息,示例`http://api.map.baidu.com/location/ip?ak=x78oVekBLBQQ6VIvPoX7eNDj&callback=yyfm_nativeAppAdapter_jsonp_0&t=1403883547232`
     *   }
     */
    nativeAppAdapter.getCity = (function() {
        var citiesHash = {
            '1': {
                c: '全国'
                // ,p:'全国'
            },
            '131': {
                c: '北京市'
                // ,p:'北京市'
            },
            '289': {
                c: '上海市'
                // ,p:'上海市'
            },
            '332': {
                c: '天津市'
                // ,p:'天津市'
            },
            '340': {
                c: '深圳市',
                p: '广东省'
            },
            '257': {
                c: '广州市',
                p: '广东省'
            },
            '233': {
                c: '西安市',
                p: '陕西省'
            },
            '218': {
                c: '武汉市',
                p: '湖北省'
            },
            '75': {
                c: '成都市',
                p: '四川省'
            },
            '268': {
                c: '郑州市',
                p: '河南省'
            },
            '132': {
                c: '重庆市'
                // ,p:'重庆市'
            },
            '288': {
                c: '济南市',
                p: '山东省'
            },
            '179': {
                c: '杭州市',
                p: '浙江省'
            },
            '58': {
                c: '沈阳市',
                p: '辽宁省'
            },
            '224': {
                c: '苏州市',
                p: '江苏省'
            },
            '315': {
                c: '南京市',
                p: '江苏省'
            }
        };
        return function(callback) {
            var id,
                name,
                province;
            if (util.objectType(callback) == "Function") {
                id = query.c || query.cid || query.cityid;
                if (id && citiesHash[id]) {
                    callback.call(window, {
                        id: id,
                        name: citiesHash[id].c,
                        province: citiesHash[id].p || citiesHash[id].c,
                        otherData: null
                    });
                } else {
                    // 这个key在百度账号youyo1122下
                    util.getJsonp({
                        url: 'http://api.map.baidu.com/location/ip?ak=x78oVekBLBQQ6VIvPoX7eNDj&callback=?',
                        success: function(data) {
                            if (data.status === 0 && data.content && data.content.address_detail) {
                                if (data.content.address_detail.city) {
                                    name = data.content.address_detail.city;
                                }
                                if (data.content.address_detail.city_code) {
                                    id = data.content.address_detail.city_code;
                                }
                                if (data.content.address_detail.province) {
                                    province = data.content.address_detail.province;
                                }
                            }
                            callback.call(window, {
                                id: id || null,
                                name: name || null,
                                province: province || null,
                                otherData: data
                            });
                        }
                    });
                }
            }
        };
    })();

    window.naa = window.nativeAppAdapter = nativeAppAdapter;

})(window, document, navigator, location);
