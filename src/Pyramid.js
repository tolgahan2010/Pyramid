/*!
* Pyramid JavaScript Library v@VERSION
* http://pyramid.secondteam.net/
*
* Copyright 2011, Tolgahan Albayrak
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://pyramid.secondteam.net/license
*
*
* Date: @DATE
*/

var PyramidFunctions =
{
    ArrayProto:
    {
        proto: function() { return Array.prototype; },
        data: {
            indexOf: function(item) {
                for (var i = 0; i < this.length; i++) {
                    if (item == this[i])
                        return i;
                }
                return -1;
            },
            hasItem: function(item) {
                return this.indexOf(item) > -1;
            },
            pushOne: function(item) {
                if (!this.hasItem(item))
                    this.push(item);
            },
            remove: function(item) {
                var index = this.indexOf(item);
                if (index > -1)
                    this.splice(index, 1);
            },
            forEach: function(callback, thisObj) {
                if (typeof (callback) == 'function')
                    for (var i = 0; i < this.length; i++)
                    callback.apply(thisObj, [this[i], i, this]);
            },
            some: function(callback, thisObj) {
                if (typeof (callback) == 'function')
                    for (var i = 0; i < this.length; i++)
                    if (callback.apply(thisObj, [this[i], i, this]))
                    return true;
                return false;
            },
            last: function() {
                return this.length ? this[this.length - 1] : null;
            },
            random: function() {
                return this[Math.randomInt(this.length)];
            }
        }
    },
    FunctionProto:
    {
        proto: function() { return Function.prototype; },
        data:
        {
            POF: function(obj) {
                return this.prototype.isPrototypeOf(obj);
            }
        }
    },
    StringProto:
    {
        proto: function() { return String.prototype; },
        data:
        {
            trim: function() {
                return this.replace(/^\s+|\s+$/, "");
            }
        }
    }
};

String.create = function(txt, count) {
    var list = [];
    for (var i = 0; i < count; i++) list.push(txt);
    return list.join("");
};

for (var key in PyramidFunctions) {
    var obj = PyramidFunctions[key];
    var proto = obj.proto();
    for (var dkey in obj.data) {
        if (!proto[dkey])
            proto[dkey] = obj.data[dkey];
    }
}

Math.PI2 = Math.PI * 2;
Math.RADIAN = Math.PI / 180;

Math.toRadian = function(degree) {
    return degree * Math.RADIAN;
};
Math.toDegree = function(radian) {
    return radian / Math.RADIAN;
};
Math.cosD = function(degree) {
    return Math.cos(Math.toRadian(degree));
};
Math.sinD = function(degree) {
    return Math.sin(Math.toRadian(degree));
};
Math.tanD = function(degree) {
    return Math.tan(Math.toRadian(degree));
};
Math.acosD = function(degree) {
    return Math.acos(Math.toRadian(degree));
};
Math.asinD = function(degree) {
    return Math.asin(Math.toRadian(degree));
};
Math.atanD = function(degree) {
    return Math.atan(Math.toRadian(degree));
};
Math.atan2D = function(x, y) {
    return Math.atan2(Math.toRadian(x), Math.toRadian(y));
};

Math.randomInt = function(max, min) {
    max = max || 0;
    min = min || 0;
    if (max == min) return min;
    return Math.floor(min + (max - min) * Math.random());
};

for (var i = 1; i < 361; i++)
    Math["DEG" + i] = Math.RADIAN * i;


function Pyramid() {

};

Pyramid.clone = function(obj) {
    if (typeof (obj) != 'object')
        return obj;

    var o;
    if (obj instanceof Array) {
        o = [];
        obj.forEach
        (
            function(item) { o.push(Pyramid.clone(item)); }
        );
    } else {
        o = {};
        for (var key in obj) {
            var tmp = obj[key];
            if (typeof (tmp) == 'object') {
                tmp = this._copy(tmp);
            }
            o[key] = tmp;
        }
    }
    return o;
};

Pyramid.IsNUM = function() {
    for (var i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] != 'number') || isNaN(arguments[i]))
            return false;
    }
    return arguments.length > 0;
};

Pyramid.IsANUM = function() {
    for (var i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] != 'number') || isNaN(arguments[i]) || arguments[i] == 0)
            return false;
    }
    return arguments.length > 0;
};

Pyramid.IsPNUM = function() {
    for (var i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] != 'number') || isNaN(arguments[i]) || arguments[i] <= 0)
            return false;
    }
    return arguments.length > 0;
};

Pyramid.IsBOOL = function() {
    for (var i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] != 'boolean'))
            return false;
    }
    return arguments.length > 0;
};

Pyramid.IsZPNUM = function() {
    for (var i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] != 'number') || isNaN(arguments[i]) || arguments[i] < 0)
            return false;
    }
    return arguments.length > 0;
};

Pyramid.IsFNC = function() {
    for (var i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] != 'function'))
            return false;
    }
    return arguments.length > 0;
};

Pyramid.IsFSTR = function() {
    for (var i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] != 'string') || arguments[i] == "")
            return false;
    }
    return arguments.length > 0;
};
