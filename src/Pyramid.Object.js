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

/// <reference path="Pyramid.js" />
Pyramid.Object = function() {
    if (this == Pyramid) return;
    if (arguments[0]) {
        var index = Pyramid.Object.index++;
        Pyramid.Object.all[index] =
        {
            $: this,
            $class: Pyramid.Object,
            lockedProperties: [],
            updateLocked: false,
            updatedAfterLock: false,
            lockUpdate: function() {
                this.updateLocked = true;
            },
            unlockUpdate: function() {
                if (this.updateLocked) {
                    this.updateLocked = false;
                    this.callOnUpdate(this.updatedAfterLock);
                    this.updatedAfterLock = false;
                }
                return this.$;
            },
            onMembersUpdate: null,
            onDetermineMemberUpdate: null,
            determineMemberUpdate: function(name, oldValue, newValue) {
                if (this.lockedProperties.hasItem(name))
                    return false;
                if (this.onDetermineMemberUpdate)
                    return this.onDetermineMemberUpdate(name, oldValue, newValue);
                return true;
            },
            callOnUpdate: function(updated) {
                if (this.updateLocked) {
                    this.updatedAfterLock = updated || this.updatedAfterLock;
                } else {
                    if (updated) {
                        if (this.onMembersUpdate) {
                            this.onMembersUpdate(arguments);
                        }
                    }
                }
            },
            updateMembers: function() {
                var updated = false;
                for (var i = 0; i < arguments.length; i += 2) {
                    var name = arguments[i];
                    var value = arguments[i + 1];
                    if (this[name] != value) {
                        if (this.determineMemberUpdate(name, this[name], value)) {
                            this[name] = value;
                            updated = true;
                        }
                    }
                }
                this.callOnUpdate(updated);
            },
            _setv: function(n, v, lookup, notUpdate) {
                if ((lookup && lookup.hasOwnProperty(v)) || !lookup) {
                    if (this[n] != v) {
                        if (this.determineMemberUpdate(n, this[n], v)) {
                            this[n] = v;
                            this.callOnUpdate(!notUpdate);
                        }
                    }
                }
                return this[n];
            },
            _setzstr: function(n, v, notUpdate) {
                if (typeof (v) != 'undefined')
                    v = String(v);
                if (v && this[n] != v) {
                    if (this.determineMemberUpdate(n, this[n], v)) {
                        this[n] = v;
                        this.callOnUpdate(!notUpdate);
                    }
                }
                return this[n];
            },
            _setstr: function(n, v, notUpdate) {
                if (Pyramid.IsFSTR(v) && this[n] != v) {
                    if (this.determineMemberUpdate(n, this[n], v)) {
                        this[n] = v;
                        this.callOnUpdate(!notUpdate);
                    }
                }
                return this[n];
            },
            _setstri: function(n, v, notUpdate) {
                if (Pyramid.IsFSTR(v) && String(this[n]).toUpperCase() != v.toUpperCase()) {
                    if (this.determineMemberUpdate(n, this[n], v)) {
                        this[n] = v;
                        this.callOnUpdate(!notUpdate);
                    }
                }
                return this[n];
            },
            _setcolor: function(n, v, notUpdate) {
                if (Pyramid.IsZPNUM(v)) {
                    v = v & 0xFFFFFF;
                    if (this.determineMemberUpdate(n, this[n], v)) {
                        if (this.determineMemberUpdate(n, this[n], v)) {
                            this[n] = v;
                            this.callOnUpdate(!notUpdate);
                        }
                    }
                }
                return this[n];
            },
            _setalpha: function(n, v, notUpdate) {
                if (Pyramid.IsZPNUM(v)) {
                    if (v > 1) v = 1;
                    if (v != this[n]) {
                        if (this.determineMemberUpdate(n, this[n], v)) {
                            this[n] = v;
                            this.callOnUpdate(!notUpdate);
                        }
                    }
                }
                return this[n];
            },
            _setbool: function(n, v, notUpdate) {
                if (Pyramid.IsBOOL(v) && this[n] != v) {
                    if (this.determineMemberUpdate(n, this[n], v)) {
                        this[n] = v;
                        this.callOnUpdate(!notUpdate);
                    }
                }
                return this[n];
            },
            _setnum: function(n, v, notUpdate) {
                if (this.$numberFormat) v = this.$numberFormat(v);
                if (Pyramid.IsNUM(v)) {
                    if (this.determineMemberUpdate(n, this[n], v)) {
                        this[n] = v;
                        this.callOnUpdate(!notUpdate);
                    }
                }
                return this[n];
            },
            _setzpnum: function(n, v, notUpdate) {
                if (this.$numberFormat) v = this.$numberFormat(v);
                if (Pyramid.IsZPNUM(v) && this[n] != v) {
                    if (this.determineMemberUpdate(n, this[n], v)) {
                        this[n] = v;
                        this.callOnUpdate(!notUpdate);
                    }
                }
                return this[n];
            },
            _setpnum: function(n, v, notUpdate) {
                if (this.$numberFormat) v = this.$numberFormat(v);
                if (Pyramid.IsPNUM(v)) {
                    if (this[n] != v) {
                        if (this.determineMemberUpdate(n, this[n], v)) {
                            this[n] = v;
                            this.callOnUpdate(!notUpdate);
                        }
                    }
                }
                return this[n];
            },
            _inc: function(n, v) {
                if (this.$numberFormat) v = this.$numberFormat(v);
                if (Pyramid.IsANUM(v)) {
                    if (this.determineMemberUpdate(n, this[n], this[n] + v)) {
                        this[n] += v;
                        this.callOnUpdate(true);
                    }
                }
                return this[n];
            },
            _incalpha: function(n, v) {
                if (Pyramid.IsANUM(v)) {
                    v = this[n] + v;
                    if (v < 0) v = 0;
                    if (v > 1) v = 1;
                    if (this[n] != v) {
                        if (this.determineMemberUpdate(n, this[n], v)) {
                            this[n] = v;
                            this.callOnUpdate(true);
                        }
                    }
                }
                return this[n];
            },
            _incs: function() {
                var updated = false;
                for (var i = 0; i < arguments.length; i += 2) {
                    var n = arguments[i];
                    var v = arguments[i + 1];
                    if (Pyramid.IsANUM(v)) {
                        if (this.$numberFormat) v = this.$numberFormat(v);
                        if (this.determineMemberUpdate(n, this[n], this[n] + v)) {
                            this[n] += v;
                            updated = true;
                        }
                    }
                }
                this.callOnUpdate(updated);
                return this.$;
            },
            _setnums: function() {
                var updated = false;
                for (var i = 0; i < arguments.length; i += 2) {
                    var n = arguments[i];
                    var v = arguments[i + 1];
                    if (this.$numberFormat) v = this.$numberFormat(v);
                    if (Pyramid.IsNUM(v) && this[n] != v) {
                        if (this.determineMemberUpdate(n, this[n], v)) {
                            this[n] = v;
                            updated = true;
                        }
                    }
                }
                this.callOnUpdate(updated);
                return this.$;
            },
            _setzpnums: function() {
                var updated = false;
                for (var i = 0; i < arguments.length; i += 2) {
                    var n = arguments[i];
                    var v = arguments[i + 1];
                    if (this.$numberFormat) v = this.$numberFormat(v);
                    if (Pyramid.IsZPNUM(v) && this[n] != v) {
                        if (this.determineMemberUpdate(n, this[n], v)) {
                            this[n] = v;
                            updated = true;
                        }
                    }
                }
                this.callOnUpdate(updated);
                return this.$;
            },
            _eachMember: function(callback, thisObj) {
                if (typeof callback == 'function') {
                    for (var key in this) {
                        if (key.charAt(0) != "$")
                            callback.call(thisObj, this[key], key);
                    }
                }
            },
            _someMember: function(callback, thisObj) {
                if (typeof callback == 'function') {
                    for (var key in this) {
                        if (key.charAt(0) != "$") {
                            if (callback.call(thisObj, this[key], key))
                                return true;
                        }
                    }
                }
                return false;
            }
        };
        this.getHashCode = function() {
            return index;
        };
    }
};
Pyramid.Object.prototype.clone = function() {
    return $PC(this);
};

Pyramid.Object.prototype.lockUpdate = function() {
    $PM(this).lockUpdate();
    return this;
};

Pyramid.Object.prototype.unlockUpdate = function() {
    return $PM(this).unlockUpdate();
};


Pyramid.Object.prototype.equals = function(obj) {
    if (this == obj) return true;
    var objHost = $PM(obj);
    if (!objHost) return false;
    var host = $PM(this);
    if (host.$class != objHost.$class) return false;

    function equals(obj1, obj2) {
        if (obj1 == obj2) return true;
        var t1 = typeof obj1;
        if (t1 == typeof obj2) {
            if (t1 == "function") return true;
            if (obj1 instanceof Array) {
                if (obj2 instanceof Array) {
                    if (obj1.length == obj2.length) {
                        for (var i = 0; i < obj1.length; i++) {
                            if (!equals(obj1[i], obj2[i]))
                                return false;
                        }
                        return true;
                    }
                }
                return false;
            } else if (obj1.attributes && obj1.style && obj1.tagName) {
                if (obj2.attributes && obj2.style && obj2.tagName) {
                    if (obj1.tagName == obj2.tagName) {
                        if (obj1.src == obj2.src && obj1.value == obj2.value && obj1.innerHTML == obj2.innerHTML && obj1.checked == obj2.checked)
                            return true;
                    }
                }
                return false;
            } else {
                var keys1 = [];
                var keys2 = [];
                for (var key in obj1) keys1.push(key);
                for (var key in obj2) keys2.push(key);
                if (equals(keys1, keys2)) {
                    var tmp = [];
                    keys1.forEach(function(key) { tmp.push(obj1[key]); });
                    keys1 = tmp;
                    tmp = [];
                    keys2.forEach(function(key) { tmp.push(obj2[key]); });
                    keys2 = tmp;

                    return equals(keys1, keys2);
                }
                return false;
            }
        }
        return false;
    }

    return !host._someMember
    (
        function(value, key) {
            return equals(value, objHost[key]);
        }
    );
};


Pyramid.Object.prototype.dispose = function() {
    var host = $PM(this);
    if (host) {
        var index = this.getHashCode();
        delete Pyramid.Object.all[index];
        var cur = host.$;
        for (var key in host) {
            var value = host[key];
            if (typeof(value) == 'object' && value != cur && value != host) {
                if (Pyramid.Object.POF(value)) {
                    try {
                        value.dispose();
                    } catch (err) { }
                }
            }
            delete host[key];
        }
        for (var key in cur) delete cur[key];
        return true;
    }
    return false;
};

Pyramid.Object.prototype.toString = function() {
    var host = $PM(this);
    if (host.$properties) {
        var ary = ["{"];
        host.$properties.forEach
        (
            function(item) {
                ary.push(item, ":'", this[item](), "'", ", ");
            },
            this
        );
        ary.pop();
        ary.push("}");
        return ary.join("");
    }
    return "[Object Pyramid.Object]";
};

Pyramid.Object.prototype.toLocaleString = function() {
    return this.toString();
};

Pyramid.Object.index = 0;
Pyramid.Object.all = {};

Pyramid.Object.Declare = function(host, obj) {
    if (Pyramid.Object.POF(host)) {
        host = $PM(host);

        for (var key in obj) {
            if (key.charAt(0) != "$") {
                host[key] = obj[key];
            }
        }
        var all = [];
        for (var key in host) all.push(key);

        if (Pyramid.IsFNC(obj.$init))
            obj.$init.call(host);

        if (Pyramid.IsFNC(obj.$class))
            host.$class = obj.$class;

        if (obj.$properties instanceof Array) {
            if (!host.$properties)
                host.$properties = [];
            host.$properties = host.$properties.concat(obj.$properties);
        }

        if (obj.$numberFormat)
            host.$numberFormat = obj.$numberFormat;

        if (obj.$notClone instanceof Array) {
            if (!host.$notClone)
                host.$notClone = [];
            host.$notClone = host.$notClone.concat(obj.$notClone);
        }

        return host;
    }
    return null;
};

Pyramid.Object.Members = function(host) {
    if (host && host.getHashCode) {
        return Pyramid.Object.all[host.getHashCode()];
    }
    return null;
};

Pyramid.Object.Clone = function(obj) {

    function deepClone(item) {
        if (typeof item == 'object') {
            if (item instanceof Array) {
                var ary = [];
                item.forEach(function(o) { ary.push(deepClone(o)); });
                return ary;
            } else {
                if (Pyramid.Object.POF(item)) {
                    return Pyramid.Object.Clone(item);
                } else {
                    var obj = {};
                    for (var key in item) { obj[key] = deepClone(item) };
                    return obj;
                }
            }
        } else {
            return item;
        }
    }

    var host = $PM(obj);
    if (!host) { return null };
    var value = new host.$class;

    var nca = host.$notClone || [];

    var valueHost = $PM(value);
    for (var key in host) {
        if (key.charAt(0) != "$") {
            if (nca.hasItem(key)) {
                valueHost[key] = host[key];
            } else {
                valueHost[key] = deepClone(host[key]);
            }
        }
    }
    return value;
};

Pyramid.Object.AddDOMEvent = function(evnt, elem, func) {
    if (!elem) return;
    if (elem.addEventListener)
        elem.addEventListener(evnt, func, false);
    else if (elem.attachEvent) {
        elem.attachEvent("on" + evnt, func);
    }
    else
        elem["on" + evnt] = func;
};
Pyramid.Object.RemDOMEvent = function(evnt, elem, func) {
    if (!elem) return;
    if (elem.removeEventListener)
        elem.removeEventListener(evnt, func, false);
    else if (elem.detachEvent) {
        elem.detachEvent("on" + evnt, func);
    }
    else
        elem["on" + evnt] = func;
};

var $PM = Pyramid.Object.Members;
var $PD = Pyramid.Object.Declare;
var $PC = Pyramid.Object.Clone;
var $PAV = Pyramid.Object.AddDOMEvent;
var $PRE = Pyramid.Object.RemDOMEvent;

Pyramid.Object.Globals =
{
    Canvas: document.createElement("canvas"),
    Canvas2: document.createElement("canvas"),
    Canvas3: document.createElement("canvas"),
    Canvas4: document.createElement("canvas"),
    canvasIndex: 0,
    getNextCanvas: function(w, h) {
        var cvlist = [this.Canvas, this.Canvas2, this.Canvas3, this.Canvas4];
        var ctxlist = [this.Context2D, this.Context22D, this.Context32D, this.Context42D];
        this.canvasIndex++;
        this.canvasIndex %= cvlist.length;
        var c = cvlist[this.canvasIndex];
        var ctx = ctxlist[this.canvasIndex];
        c.width = w;
        c.height = h;
        return { canvas: c, context: ctx };
    },
    getCSSRGBA: function(color, alpha) {
        var b = (color >> 0) & 0xff;
        var g = (color >> 8) & 0xff;
        var r = (color >> 16) & 0xff;
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    }
};

if (Pyramid.Object.Globals.Canvas.getContext) {
    Pyramid.Object.Globals.Context2D = Pyramid.Object.Globals.Canvas.getContext("2d");
    Pyramid.Object.Globals.Context22D = Pyramid.Object.Globals.Canvas2.getContext("2d");
    Pyramid.Object.Globals.Context32D = Pyramid.Object.Globals.Canvas3.getContext("2d");
    Pyramid.Object.Globals.Context42D = Pyramid.Object.Globals.Canvas4.getContext("2d");
}

Pyramid.Object.Globals.Dispose = function() {
    function dispose(obj) {
        if (typeof obj == "object") {
            if (obj instanceof Array) {
                obj.forEach(function(item, index, ary) { dispose(item); delete ary[index] });
                obj.length = 0;
            } else {
                if (Pyramid.Object.POF(obj)) {
                    try {
                        obj.dispose();
                    } catch (err) { }
                }
                else {
                    for (var key in obj) {
                        var v = obj[key];
                        delete obj[key];
                        dispose(v);
                    }
                }
            }
        }
    }
    for (var i = 0; i < arguments.length; i++) dispose(arguments[i]);
};