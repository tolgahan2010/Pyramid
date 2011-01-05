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

Pyramid.Brush.SolidBrush = function(color, alpha) {
    if (this == Pyramid.Brush) return;
    Pyramid.Brush.BrushBase.call(this);
    var host = $PD
    (
        this,
        {
            $class: Pyramid.Brush.SolidBrush,
            color: 0,
            alpha: 1,
            load: function(canvas, context, bounds) {
                return Pyramid.Object.Globals.getCSSRGBA(this.color, this.alpha);
            }
        }
    );
    host._setcolor("color", color, true);
    host._setalpha("alpha", alpha, true);
};

var p = Pyramid.Brush.SolidBrush.prototype = new Pyramid.Brush.BrushBase;

p.color = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setcolor("color", v);
};

p.alpha = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("alpha", v);
};

Pyramid.Brush.SolidStock =
{
    Black: new Pyramid.Brush.SolidBrush,
    White: new Pyramid.Brush.SolidBrush(0xFFFFFF),
    Red: new Pyramid.Brush.SolidBrush(0xFF0000),
    Green: new Pyramid.Brush.SolidBrush(0x00FF00),
    Blue: new Pyramid.Brush.SolidBrush(0xFF)
};
