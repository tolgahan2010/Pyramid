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

/// <reference path="Pyramid.EventDispatcher.js" />

Pyramid.Shadow = function() {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);
    $PD
    (
        this,
        {
            $class: Pyramid.Shadow,
            $properties: ["color", "alpha", "xOffset", "yOffset", "blur", "enabled"],
            color: 0,
            alpha: 1,
            xOffset: 5,
            yOffset: 5,
            blur: 10,
            enabled: false,
            apply: function(canvas, context) {
                if (this.enabled) {
                    context.shadowColor = Pyramid.Object.Globals.getCSSRGBA(this.color, this.alpha);
                    context.shadowBlur = this.blur;
                    context.shadowOffsetX = this.xOffset;
                    context.shadowOffsetY = this.yOffset;
                }
            },
            reset: function(canvas, context) {
                if (this.enabled) {
                    context.shadowColor = "rgba(0,0,0,0)";
                }
            }
        }
    );
};

var p = Pyramid.Shadow.prototype = new Pyramid.EventDispatcher;


p.color = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setcolor("color", v);
};
p.alpha = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("alpha", v);
};
p.xOffset = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("xOffset", v);
};
p.yOffset = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("yOffset", v);
};
p.blur = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setzpnum("blur", v);
};
p.enabled = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("enabled", v);
};
p.setParams = function(enabled, color, alpha, xOffset, yOffset, blur) {
    /// <returns type="Pyramid.Shadow" />
    var host = $PM(this);
    host.lockUpdate();
    host._setbool("enabled", enabled);
    host._setcolor("color", color);
    host._setalpha("alpha", alpha);
    host._setnums("xOffset", xOffset, "yOffset", yOffset);
    host._setzpnum("blur", blur);
    return host.unlockUpdate();
};




