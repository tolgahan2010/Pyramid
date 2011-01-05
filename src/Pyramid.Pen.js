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

/// <reference path="Pyramid.Brush.js" />

Pyramid.Pen = function(brush, weight, cap, join) {
    if (this == Pyramid.Pen) return;
    Pyramid.EventDispatcher.call(this, arguments);
    var brushHost;
    if (Pyramid.Brush.BrushBase.POF(brush)) {
        brushHost = $PM(brush);
    }
    var host = $PD
    (
        this,
        {
            $class: Pyramid.Pen,
            weight: 1,
            cap: Pyramid.Pen.Caps.butt,
            join: Pyramid.Pen.Joins.miter,
            miterLimit: 10,
            needsApply: false,
            brush: brushHost,
            load: function(canvas, context, bounds, resize) {
                if (this.brush) {
                    return this.brush.load(canvas, context, bounds, resize);
                }
                return null;
            },
            apply: function(canvas, context, bounds, resize) {
                var style = this.load(canvas, context, bounds, resize);
                if (style) {
                    context.lineWidth = this.weight;
                    context.lineCap = this.cap;
                    context.lineJoin = this.join;
                    context.miterLimit = this.miterLimit;
                }
                context.strokeStyle = style || "rgba(0,0,0,0)";
                this.needsApply = false;
            },
            onUpdate: function() {
                this.needsApply = true;
            }
        }
    );
    host._setpnum("weight", weight, true);
    host._setv("cap", cap, Pyramid.Pen.Caps, true);
    host._setv("join", join, Pyramid.Pen.Joins, true);
    brush.addEventListener("update", function() { host.update(); });
};
Pyramid.Pen.Caps =
{
    butt: "butt",
    round: "round",
    square: "square"
};
Pyramid.Pen.Joins =
{
    bevel: "bevel",
    round: "round",
    miter: "miter"
};

var p = Pyramid.Pen.prototype = new Pyramid.EventDispatcher;

p.brush = function() {
    //<returns type="Pyramid.Brush.BrushBase" />
    return $PM(this).brush.$;
};

p.weight = function(v) {
    //<returns type="Number" />
    return $PM(this)._setpnum("weight", v);
};

p.cap = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("cap", v, Pyramid.Pen.Caps);
};

p.join = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("join", v, Pyramid.Pen.Joins);
};

p.miterLimit = function(v) {
    //<returns type="Number" />
    return $PM(this)._setzpnum("miterLimit", v);
};