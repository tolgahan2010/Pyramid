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
/// <reference path="Pyramid.Matrix2D.js" />

Pyramid.Brush = {};
Pyramid.Brush.BrushBase = function() {
    if (this == Pyramid.Brush) return;
    Pyramid.EventDispatcher.call(this, arguments);
    var host = $PD
    ( 
        this,
        {
            $class: Pyramid.Brush.BrushBase,
            transform2d: new Pyramid.Matrix2D,
            needsApply: false,
            load: function(canvas, context, bounds, resize) { return null; },
            apply: function(canvas, context, bounds, resize) {
                var style = this.load(canvas, context, bounds, resize);
                context.fillStyle = style || "rgba(0,0,0,0)";
                this.needsApply = false;
            },
            onBrushUpdate: null,
            onUpdate: function() {
                this.needsApply = true;
                if (this.onBrushUpdate) this.onBrushUpdate();
            },
            $init: function() {
                this.transform2d.addEventListener("update", function() { host.update(); });
            }
        }
    )
};

var p = Pyramid.Brush.BrushBase.prototype = new Pyramid.EventDispatcher;

p.transform2D = function() {
    /// <returns type="Pyramid.Matrix2D" />
    return $PM(this).transform2d;
};