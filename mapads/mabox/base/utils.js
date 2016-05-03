/**
 * Map Ads utils 
 * @author febody
 * @date 2016-5-2
 * */

;(function(w, $, m){


	var utils = m.utils = {};
	 
    var ArrayProto = Array.prototype;
    var ObjProto = Object.prototype;
    var FuncProto = Function.prototype;

    var push = ArrayProto.push;
    var slice = ArrayProto.slice;
    var concat = ArrayProto.concat;
    var toString = ObjProto.toString;
    var hasOwnProperty = ObjProto.hasOwnProperty;

    var nativeForEach = ArrayProto.forEach;
    var nativeMap = ArrayProto.map;
    var nativeReduce = ArrayProto.reduce;
    var nativeReduceRight = ArrayProto.reduceRight;
    var nativeFilter = ArrayProto.filter;
    var nativeEvery = ArrayProto.every;
    var nativeSome = ArrayProto.some;
    var nativeIndexOf = ArrayProto.indexOf;
    var nativeLastIndexOf = ArrayProto.lastIndexOf;
    var nativeIsArray = Array.isArray;
    var nativeKeys = Object.keys;
    var nativeBind = FuncProto.bind;

    var breaker = {};

	/**
	 * each iterator
	 * @param{Object} input object
	 * @param{Function} iterator
	 * @param{Object} context
	 *
	 */
    var each = utils.each = utils.forEach = function (obj, iterator, context) {
        if (obj == null) {
            return;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        } else {
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) {
                        return;
                    }
                }
            }
        }
    };

	/**
	 * bind function
	 * @param{Function} function will be binded
	 * @param{Object} context
	 *
	 * @return{Function} 
	 */
    utils.bind = function (func, context) {
        if (func.bind === nativeBind && nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(context, args.concat(slice.call(arguments)));
        };
    };

	/**
	 * is array
	 * @param{Object} object will be judged
	 *
	 * @return{Boolean} 
	 */
    utils.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };

	/**
	 * is object
	 * @param{Object} object will be compared
	 *
	 * @return{Boolean} 
	 */
    utils.isObject = function (obj) {
        return obj === Object(obj);
    };
    each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
        utils['is' + name] = function (obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });
	
	/**
	 * extend method
	 * @param{Object} first object will be extended
	 * 
	 * @return{Object} return value
	 */
    utils.extend = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };
	/**
	 * isNull
	 * @param{Object} 
	 *
	 * @return{Boolean}
	 */
	utils.isNull = function(obj) {
		return obj === null;
	};

	/**
	* 转化成数组
	* @param{Object}
	* @return{Array}
	*/
	/**
	* copmare two version ,if sv1 less than sv2 ,will return false, or will return true
	* @param{String} first version
	* @param{String} second version
	* @param{String} sep of version
	*
	* @retun{Boolean} 
	*/
	utils.compareVersion = function(sv1, sv2, sep) {
		if (!sv1 || !sv2 || (typeof sv1 != "string") || (typeof sv2 != "string")) {
			throw new Error("sv should be a string");
		}
		sep =  sep || '.';
		var arr1 = sv1.split(sep), arr2 = sv2.split(sep);
		var offset = arr1.length - arr2.length;
		if(offset > 0) {
			while(offset--){
				arr2.push(0);
			}
		} else {
			offset *= -1;
			while(offset--){
				arr2.push(0);
			}
		}

		var total1 = 0, total2 = 0;
		var reduce = function(sum, value, index, source) {
			return value * Math.pow(10, source.length - index) + sum;
		};
		total1 = arr1.reduce(reduce, total1);
		total2 = arr2.reduce(reduce, total2);

		return total1 > total2;
	}
		
})(window, Zepto, window['MapAds'] || (window['MapAds'] = {}));
