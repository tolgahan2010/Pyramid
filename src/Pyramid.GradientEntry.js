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

Pyramid.GradientEntry = function(color, alpha, ratio) {
    if (this == Pyramid) return;
    Pyramid.Object.call(this, arguments);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.Brush.GradientEntry,
            $properties: ["color", "alpha", "ratio"],
            color: 0,
            alpha: 1,
            ratio: -1,
            apply: function(gradient, w, lastStop, index, count) {
                var css = Pyramid.Object.Globals.getCSSRGBA(this.color, this.alpha);
                var ratio = this.ratio;
                if (!index) ratio = 0;
                else if (lastStop >= w || index == count - 1) ratio = 1;
                else if (ratio < 0) {
                    ratio = index / count;
                }
                gradient.addColorStop(ratio, css);
                return ratio * w;
            }
        }
    );
    host._setcolor("color", color, true);
    host._setalpha("alpha", alpha, true);
    host._setalpha("ratio", ratio, true);
};

var p = Pyramid.GradientEntry.prototype = new Pyramid.Object;

p.color = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setcolor("color", v);
};

p.alpha = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("alpha", v);
};

p.ratio = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("ratio", v);
};