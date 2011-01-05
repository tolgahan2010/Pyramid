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

/// <reference path="Pyramid.DisplayObject.js" />
/// <reference path="Pyramid.Graphics.js" />

var p;
/** GraphicsElement Begin **/

Pyramid.GraphicsElement = function() {
    if (this == Pyramid) return;
    Pyramid.DisplayObject.call(this);

    $PD
    (
        this,
        {
            $class: Pyramid.GraphicsElement,
            graphics: new Pyramid.Graphics,
            graphicsChanged: false,
            onRender: function(canvas, context, x, y, w, h) {
                var g = $PM(this.graphics);
                var ret = g.canDraw(Number.MIN_VALUE, Number.MIN_VALUE);
                if (ret) {
                    this.graphicsChanged = false;
                    g.render(canvas, context);
                }
                return ret;
            },
            $init: function() {
                var me = this;
                this.graphics.addEventListener("update", function() {
                    me.graphicsChanged = true;
                    me.update();
                });
            },
            getUnscaledBounds: function() {
                var host = $PM(this.graphics);
                var bounds = host.bounds;
                if (bounds) {
                    var hbounds = $PM(bounds);
                    return { x: hbounds.x, y: hbounds.y, width: hbounds.width, height: hbounds.height };
                }
                return { x: 0, y: 0, width: 0, height: 0 };
            }
        }
    );

};

Pyramid.GraphicsElement.prototype = new Pyramid.DisplayObject;

p = Pyramid.GraphicsElement.prototype;

p.graphics = function() {
    /// <summary>Gets the current graphics context</summary>
    /// <returns type="Pyramid.Graphics">Returns a Pyramid.Graphics instance</returns>
    return $PM(this).graphics;
};


/** GraphicsElement End   **/
