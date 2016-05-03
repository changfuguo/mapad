/**
 * Map Ads url 
 * @author febody
 * @date 2016-5-2
 * */

;(function(w, $, m){


	var url = m.url = {};
	var utils = m.utils;
	/**
	 * get all params and return an object
	 * @param{string} url for parse
	 * @return{Object} return value
	 */
	var getObjectFromUrl = url.getObjectFromUrl = function(url) {
		var result = {};     
		var reg = new RegExp('([\\?|&])(.+?)=([^&?#]*)', 'ig');    
		var arr = reg.exec(url);    
		   while (arr) {        
				result[arr[2]] = arr[3];        
				arr = reg.exec(url);    
			}       
		return result; 
	};
	/**
	 * parse url from object 
	 * @param{url} url
	 * @param{Object} input object
	 * @return{String} return string
	 */
	url.replaceUrlParams = function(url, extraParams) {
		var reg = new RegExp('([\\?|&])(.+?)=([^&?]*)', 'ig');
		 
		var oldParams = getObjectFromUrl(url);
		extraParams = extraParams || {};
		oldParams = utils.extend(oldParams, extraParams);
		
		url =  url.replace(reg, function(matched, sep, key, value){
			var n =  sep + key + '=' + (oldParams[key] || value);
		
			delete oldParams[key];
			return n;
		});

		var params = [];
		for(var attr in oldParams) {
			params.push(attr + '=' + decodeURIComponent(oldParams[attr]));
			
		}
		if(params.length > 0){
			if (url.indexOf('?') > -1){
				url = url + '&' + params.join('&') 
			} else {
				url = url + '?' + params.join('&');
			}
		}
		return url;
	
	};

	/**
	 * get value by given key
	 * @param{String} input url
	 * @param{key} input key
	 *
	 * @return{String} return value
	 */

	url.getUrlValueByKey = function(url, key) {
		debugger;
		var reg = new RegExp('(\\?|&)' + key + '=([^&?]*)', 'i');    
		var arr = url.match(reg);    
		if (arr) {        
			 return arr[2];    
		}       
		return null;
	
	};


	/**
	* 根据json得到query形式
	*/
		
})(window, Zepto, window['MapAds'] || (window['MapAds'] = {}));
