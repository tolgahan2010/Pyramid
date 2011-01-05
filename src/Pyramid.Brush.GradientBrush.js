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
/// <reference path="Pyramid.GradientEntry.js" />

Pyramid.Brush.GradientBrush = function(type, rotation, entryArray) {
    if (this == Pyramid.Brush) return;
    Pyramid.Brush.BrushBase.call(this);
    if (type != "radial") type = "linear";

    rotation = Number(rotation) || 0;

    var elist = [];

    if (entryArray instanceof Array) {
        entryArray.forEach
        (
            function(item) {
                if (Pyramid.GradientEntry.POF(item))
                    elist.push(item);
            }
        );
    }

    $PD
    (
        this,
        {
            $class: Pyramid.Brush.GradientBrush,
            $properties: ["entries", "type"],
            entries: elist,
            type: type,
            rotation: rotation,
            load: function(canvas, context, bounds) {
                if (!this.entries.length)
                    return null;
                var bhost = $PM(bounds);
                var w = bhost.width;
                var h = bhost.height;
                if (!w || !h) return null;
                var x = bhost.x;
                var y = bhost.y;

                var gradient;
                if (this.type == "linear") {
                    var r = 0, b = 0;
                    var rot = this.rotation;

                    var radian = Math.toRadian(rot);

                    var r = Math.cos(radian) * w;
                    var b = Math.sin(radian) * h;

                    if (r < 0) {
                        var ww = -r;
                        r = x;
                        x += ww;
                    }

                    if (b < 0) {
                        var hh = -b;
                        b = y;
                        y += hh;
                    }

                    if (rot % 90) {
                        var difx, dify;
                        if (x < r) {
                            difx = (w - r + x) * .5;
                        } else {
                            difx = (w - x + r) * .5;
                        }
                        if (y < b) {
                            dify = (h - b + y) * .5;
                        } else {
                            dify = (h - y + b) * .5;
                        }
                        x += difx;
                        r += difx;
                        y += dify;
                        b += dify;
                    }
                    gradient = context.createLinearGradient(x, y, r, b);
                } else {
                    var cx = x + w * .5;
                    var cy = y + h * .5;
                    gradient = context.createRadialGradient(cx, cy, 1, cx, cy, Math.sqrt(w * w + h * h) * .5);
                }

                var lastStop = 0;
                var len = this.entries.length;
                this.entries.forEach
                (
                    function(item, index) {
                        lastStop = $PM(item).apply(gradient, w, lastStop, index, len);
                    }
                );

                return gradient;
            }
        }
    );
};
Pyramid.Brush.GradientBrush.Types = { linear: "linear", radial: "radial" };
var p = Pyramid.Brush.GradientBrush.prototype = new Pyramid.Brush.BrushBase;

p.entries = function() {
    /// <returns type="Array" />
    return $PM(this).entries.slice();
};

p.rotation = function(v) {
    return $PM(this)._setnum("rotation", v);
};

p.type = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("type", v, Pyramid.Brush.GradientBrush.Types);
};

p.addEntry = function(entry, index) {
    /// <returns type="Pyramid.Entry" />
    if (Pyramid.GradientEntry.POF(entry)) {
        var host = $PM(this);
        if (!Pyramid.IsZPNUM(index)) index = host.entries.length;
        if (index > host.entries.length) index = host.entries.length;
        host.entries.splice(index, 0, entry);
        host.update();
    }
    return entry;
};

p.removeEntryAt = function(index) {
    /// <returns type="Pyramid.Entry" />
    var host = $PM(this);
    if (index < 0 || index >= host.entries.length) return null;
    var entry = host.entries[index];
    host.entries.splice(index, 1);
    host.update();
    return entry;
};

p.removeEntryAt = function(entry) {
    /// <returns type="Pyramid.Entry" />
    var host = $PM(this);
    return this.removeEntryAt(host.entries.indexOf(entry));
};

p.add = function(color, alpha, ratio) {
    /// <returns type="Pyramid.Brush.GradientBrush" />
    this.addEntry(new Pyramid.GradientEntry(color, alpha, ratio));
    return this;
};

p.clear = function() {
    var host = $PM(this);
    host.entries.length = 0;
    host.update();
};
