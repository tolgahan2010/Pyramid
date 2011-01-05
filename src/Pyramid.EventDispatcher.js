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

/// <reference path="Pyramid.Object.js" />
/// <reference path="Pyramid.Event.js" />

var p;

/** EventDispatcher Begin **/
Pyramid.EventDispatcher = function() {
    if (this == Pyramid) return;
    Pyramid.Object.call(this, arguments);

    function updateMe(host) {
        if (!host || !host.$ || !host.updateFrozen) return;
        if (!host.updateFrozen.length) {

            if (host.onUpdate != null)
                host.onUpdate();
            if (host.updateHandler != null)
                host.updateHandler(edHost);
            host.$.dispatchEvent(Pyramid.Event.UpdateEvent);
        }
        host.waitingUpate = false;
    }
    var _timeout = 0;
    function callUpdateMe() {
        edHost.waitingUpdate = true;
        clearTimeout(_timeout);
        _timeout = setTimeout(updateMe, 1, edHost);
    }

    var edHost = $PD
    (
        this,
        {
            $class: Pyramid.EventDispatcher,
            _allEvents: {},
            updateHandler: null,
            onDetermineMemberUpdate: function(name, oldValue, newValue) {
                var result = false;
                var changeEvent = new Pyramid.Event.PropertyChangeEvent("propertyChange", false, true, name, oldValue, newValue);
                this.$.dispatchEvent(changeEvent);
                if (!changeEvent.cancelled()) {
                    $PM(changeEvent).type = "propertyChanged";
                    this.$.dispatchEvent(changeEvent);
                    result = true;
                }
                changeEvent.dispose();
                return result;
            },
            updateFrozen: [],
            onUpdate: null,
            waitingUpdate: false,

            update: function() {
                if (!this.updateFrozen.length) {
                    if (this.onUpdate != null)
                        this.onUpdate();
                    if (this.updateHandler != null)
                        this.updateHandler(this);
                    this.$.dispatchEvent(Pyramid.Event.UpdateEvent);
                }
            },
            onMembersUpdate: function(args) {
                this.update();
            },
            onFreezeUpdate: null,
            freezeUpdate: function(v) {
                if (v) {
                    this.updateFrozen.push();
                    this.updateLocked = true;
                } else {
                    this.updateFrozen.pop();
                    if (!this.updateFrozen.length) {
                        this.updateLocked = false;
                        this.updateAfterLock = false;
                    }
                }
                if (typeof this.onFreezeUpdate == "function")
                    this.onFreezeUpdate(v);
            }
        }
    );
};

Pyramid.EventDispatcher.prototype = new Pyramid.Object;

p = Pyramid.EventDispatcher.prototype;

p.addEventListener = function(type, callback) {
    if (typeof type == 'object') {
        for (var key in type)
            this.addEventListener(key, type[key]);
    } else if (typeof type == 'string') {
        if (type != '' && typeof (callback) == 'function') {
            var all = $PM(this)._allEvents;
            var ary = all[type];
            if (!ary) ary = all[type] = [];
            ary.pushOne(callback);
        }
    }
};

p.removeEventListener = function(type, callback) {
    if (typeof type == 'object') {
        for (var key in type)
            this.removeEventListener(key, type[key]);
    } else if (typeof type == 'string') {
        if (type != "" && typeof (callback) == 'function') {
            var all = $PM(this)._allEvents;
            var ary = all[type];
            if (ary) {
                ary.remove(callback);
                if (!ary.length)
                    delete all[type];
            }
        }
    }
};
p.dispatchEvent = function(event) {
    if (Pyramid.Event.POF(event)) {
        var host = $PM(this);
        var type = event.type();
        var all = host._allEvents;
        var ary = all[type];
        if (ary) {
            var ehost = $PM(event);
            ehost.target = this;
            ehost.currentTarget = this;
            ary.some
            (
                function(item) {
                    item.apply(null, [event]);
                    return event.cancelled();
                }
            );
            ehost.target = null;
            ehost.currentTarget = null;
        }
        if (typeof (host.onDispatchEvent) == 'function')
            host.onDispatchEvent(event);
    }
};
p.hasEvent = function(type) {
    var all = $PM(this).all;
    for (var i = 0; i < arguments.length; i++) {
        if (all[arguments[i]])
            return true;
    }
    return false;
};

p.broadcastEvent = function(event) {
    if (Pyramid.Event.POF(event)) {
        var host = $PM(this);
        var type = event.type();
        var all = host._allEvents;
        var ary = all[type];
        if (ary) {
            var ehost = $PM(event);
            ehost.target = this;
            ehost.currentTarget = this;
            ary.forEach
            (
                function(item) {
                    item.apply(null, [event]);
                }
            );

            ehost.target = null;
            ehost.currentTarget = null;
        }
        if (typeof (host.onBroadcastEvent) == 'function')
            host.onBroadcastEvent(event);
    }
};
/** EventDispatcher End **/

Pyramid.Timeline = function(target) {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);
    var init = false;
    var host = $PD
    (
        this,
        {
            $class: Pyramid.Timeline,
            data: [],
            max: 0,
            getTarget: function() {
                return target;
            },
            init: function() {
                this.data.forEach
                (
                    function(item) {
                        if (item.ef > this.max)
                            this.max = item.ef;
                        if (Pyramid.IsFNC(item.i)) {
                            item.data = item.i.call(target, item.sf, item.ef);
                        }
                    },
                    this
                );
            },
            process: function(frame) {
                if (!init) {
                    init = true;
                    this.init();
                }
                this.data.forEach
                (
                    function(item) {
                        if (item.l > 0) {
                            frame %= (this.max + 1);
                            if (frame == item.ef)
                                item.l--;
                        }
                        if (frame >= item.sf && frame <= item.ef) {
                            var percent = (frame - item.sf) / item.fl;
                            var value = item.e(percent, 1);
                            item.f.call(target, value, item.data);
                        }
                    },
                    this
                );
            }
        }
    );
};

Pyramid.Timeline.Easing =
{
    regular: function(t, d) { return t / d; },
    cubic: {
        easeIn: function(t, d) { return (t /= d) * t * t; },
        easeOut: function(t, d) { return ((t = t / d - 1) * t * t + 1); },
        easeInOut: function(t, d) {
            if ((t /= d * 0.5) < 1) return 0.5 * t * t * t;
            return 0.5 * ((t -= 2) * t * t + 2);
        }
    },
    back: {
        easeIn: function(t, d) { return (t /= d) * t * ((1.70158 + 1) * t - 1.70158); },
        easeOut: function(t, d) { return ((t = t / d - 1) * t * ((1.70158 + 1) * t + 1.70158) + 1); },
        easeInOut: function(t, d) {
            var ss = 1.70158, c = 1;
            if ((t /= d * 0.5) < 1) return c * 0.5 * (t * t * (((ss *= (1.525)) + 1) * t - ss));
            return c / 2 * ((t -= 2) * t * (((ss *= (1.525)) + 1) * t + ss) + 2);
        }
    }
};

var p = Pyramid.Timeline.prototype = new Pyramid.EventDispatcher;

p.add = function(initCallback, frameCallback, startFrame, endFrame, easing, loop) {
    ///<returns type="Object" />
    if (!Pyramid.IsFNC(frameCallback))
        return null;
    startFrame = Number(startFrame) || 0;
    endFrame = Number(endFrame) || 0;
    if (startFrame < 0) startFrame = 0;
    if (endFrame < 0) endFrame = 0;
    if ((endFrame - startFrame) < 0)
        return null;
    loop = Number(loop) || 0;
    if (!Pyramid.IsFNC(easing))
        easing = Pyramid.Timeline.Easing.regular;

    var obj = { i: initCallback, f: frameCallback, sf: startFrame, ef: endFrame, fl: endFrame - startFrame, e: easing, l: loop };
    $PM(this).data.push(obj);
    return obj;
};

p.remove = function(obj) {
    $PM(this).data.remove(obj);
};