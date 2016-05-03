/*
* map ads core file
*
*/

;(function(w){
    var core = {};

    core.version = "1.0.0";

    core.name = "MapAds";
    
    var now = (+new Date());
    var _id = (now + '').slice(-3);

    /**
    * 获取当前环境下唯一标志
    * @return{Number} id 随机数
    */
    core.getId = function(){
        return _id++;
    };

    core.emptyFn = function(){};
    /**
    * inherit simple realize 
    * @param{Function} 
    * @param{Function}
    **/
    core.inherit = function(subClass, superClass) {
    
        if(arguments.length != 2){
            throw new Error("must assign subClass");
        }       

        for(var i = 0, n = arguments.length;i<n;i++){
        
            if(typeof arguments[i] != "function"){
                throw new Error("all class must be function");
            }       
        }       
        var oSuper = new superClass();
        for(var key in oSuper) {
            if(!subClass.prototype[key]){
                subClass.prototype[key] = oSuper[key];
            }       
        
        }       
        subClass.prototype.constructor = subClass;
    };

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

        res.isMobile = mobileReg.test(ua) || res.isNull;
        res.isPc = !res.isMobile;
        // 只有7.0.0版本以上，给userAgent做了特殊处理，才返回true。经过导航组件的web页面，有时候会莫名的丢失ua，不确定ua是什么形式。
        var isNative = (ua.indexOf("baidumap_andr") > -1) || (ua.indexOf("baidumap_ipho") > -1 || (ua.indexOf("baidumap_ipad") > -1));
        res.isNative = !res.isWeibo && !res.isWeixin && (isNative );
        return res;
    }());
    core.plat = plat;
    w[core.name] = core;
})(window);
