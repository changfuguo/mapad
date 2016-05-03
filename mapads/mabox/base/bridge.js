/**
 * @file adapter for android and ios interaction
 * @requires ['utils.js']
 * @author febody
 * @date 2016-5-2
 */


;(function(w, $,m){
	
	var ada = m.bridge = {};
	var utils = m.utils;
	var url = m.url;

	var HEAD = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
 
	/**
	* make iframe request
	* @param{String} url 
	*/

	function makeIframeRequest(url, notime) {
		var iframe = document.createElement('iframe');
		iframe.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:0;height:0;';
		iframe.id = "mapAdIframeRequest_" + m.getId();
		iframe.setAttribute('src', url.replaceUrlParams(url, {"_mat":notime ? "" : + new Date})); 	
		iframe.onload = iframe.onreadystatechange = function(){
			document.body.removeChild(iframe);		
			iframe = null;	
		};	
		document.body.appendChild(iframe);		
	}	
	
	/**
	* make anchor request
	* @param{String} url 
	*/

	function makeAnchorRequest(url, notime) {
		var a = document.createElement('a');
		a.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:0;height:0;';
		a.id = "mapAdAnchorRequest_" + m.getId();
	 	a.setAttribute('src', url.replaceUrlParams(url, {"_mat":notime ? "" : + new Date})); 	
		document.body.appendChild(a);
		setTimeout(function(){
			document.body.removeChild(a);
			a = null;
		},100);
	}	

	/**
	* load js and jsonp 
	* @param{Object|String}
	* @param{Function}
	* @param{Object}
	* @param{Number}
	*/
	function loadJs (options, success, error, data, timeout){

		var js = document.createElement('script');
		var url, error;
		
		if (utils.isString(url)) {
			url = options;
			success = utils.isFunction(success) ? success : m.emptyFn;
			error = utils.isFunction(error) ? error : m.emptyFn;
			data = utils.isObject(data) ? data : {};
		} else {
			url = options.url;
			data =  options.data;
			success = options.success || m.emptyFn;
			error = options.error || m.emptyFn;
			timeout = options.timeout;
		}
		timeout = timeout || 200;
		data = data || {};
		if (utils.isObject(data)) {
			url = utils.replaceUrlParams(url, data);
		}
		url = url.replace(/[&?]{1,2}/, '?');

		var done = true;
		var timer;
		var clear = function () {
			timer && clearTimeout(timer);
			js.onload = js.onreadystatechange = js.onerror = null;
			js = null;
		};
		var onload = function(e,isTimeout){
			if (js && ( !js.readyState || /loaded|complete/.test(js.readyState))) {
				clear();
				if(done && utils.isFunction(success)) {
					success.call(null,e,isTimeout);
				}
			}
		};
	 	var errorCallback = function(evt) {
        	clear();
        	if (done) {
            	error(evt);
        	}
        	done = false;
    	};
    	timer = setTimeout(function() {
	        clear();
	        if (done) {
	            error('timeout');
	        }
	        done = false;
	    }, timeout);

		js.onload = js.onreadystatechange = js.onerror = onload;
		HEAD.appendChild(js);
	}
	var callbackReg = /(&|\?)callback=([^&]*)?(&|$)/g;
	var  appendCallback =  function(url, fn) {
            if (!utils.isFunction(fn) || url == '') {
                throw new Error("callback function should be a function and url can't be blank.");
            }
            var callbackName = "_mapadsCallback" + m.getId();
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
                result = url.indexOf('?') > -1 ? (url +  '&callback=' + callbackName) : (url + '?' + 'callback=' + callbackName);
            }

            return result;
    };
	/**
	* load js by jsonp
	*/

	function loadJsonp(url, success, error, data, timeout) {
		if(utils.isObject(url)) {
			success = url.success;
			error = url.error;
			data = url.data;
			timeout = url.timeout;
			url = url.url;
		}

		 
		url = appendCallback(url, success);
		loadJs(url, undefined, error, data, 200);

	}

	function requestBdApi(url, data, success) {
        if (utils.isFunction(data)) {
            success = data;
            data = {};
        }
        url = utils.replaceUrlParams(url, data);
        if (utils.isFunction(success) == "Function") {
            url = appendCallback(url, success);
        };
        makeIframeRequest(url, true);
    };
	/**
	* get client infomation
	*/
	ada.getClientInfo = function(callback){
		var tmpCallback = function(dataStr) {
            var data = JSON.parse(dataStr);
            if (utils.isFunction(callback) == "Function") {
                callback.call(window, data);
            }
        }

    	requestBdApi("bdapi://getNativeInfo", tmpCallback);
	};
})(window, Zepto,window['MapAds'] || (window['MapAds'] = {}));
