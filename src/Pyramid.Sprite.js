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

/// <reference path="Pyramid.DisplayObjectContainer.js" />

Pyramid.Sprite = function() {
    if (this == Pyramid) return;
    Pyramid.DisplayObjectContainer.call(this);

    $PD
    (
        this,
        {
            $class: Pyramid.GraphicsElement,
            graphics: new Pyramid.Graphics,
            graphicsChanged: false,
            bounds: { x: 0, y: 0, w: 0, h: 0 },
            onRender: function(canvas, context, x, y, w, h) {
                if (!this.bounds.w)
                    return null;

                var g = $PM(this.graphics);
                var ret = g.canDraw(Number.MIN_VALUE, Number.MIN_VALUE);
                if (ret) {
                    this.graphicsChanged = false;
                    g.render(canvas, context);
                }

                this.children.forEach
                (
                    function(child) {
                        var bounds = $PM(child).getUnscaledBounds();
                        var cw = bounds.width;
                        var ch = bounds.height;
                        if (child.visible() && cw && ch) {

                            var c2d = context;
                            c2d.save();

                            c2d.globalAlpha = child.alpha();

                            var ctm = child.currentTransform();

                            $PM(ctm).apply2D(c2d);

                            ctm.dispose();

                            $PM(child.shadow()).apply(canvas, c2d);
                            $PM(child).render(canvas, context, 0, 0, cw, ch);
                            $PM(child.shadow()).reset(canvas, c2d);

                            $PM(child.reflection()).apply(child, canvas, context, 0, child.height(), cw, ch);

                            c2d.restore();

                        }
                    }
                );
                var b = this.bounds;
                return { x: b.x, y: b.y, h: b.h, w: b.w };
            },
            $init: function() {
                var me = this;
                this.graphics.addEventListener("update", function() {
                    me.graphicsChanged = true;
                    me.update();
                });
            },
            calculateBounds: function() {
                var x = 0xFFFFFF, y = 0xFFFFFF, w = -0xFFFFFF, h = -0xFFFFFF;

                var g = $PM(this.graphics);
                if (g.bounds) {
                    var b = $PM(g.bounds);

                    x = b.x;
                    y = b.y;
                    w = b.width;
                    h = b.height;
                }

                this.children.forEach
                (
                    function(child) {
                        if (child.visible()) {
                            var cbrt = child.transformedBounds();

                            var hcbrt = $PM(cbrt);
                            var cl = hcbrt.x, ct = hcbrt.y, cr = hcbrt.x + hcbrt.width, cb = hcbrt.y + hcbrt.height;
                            //cl = 0;
                            //ct = 0;


                            if (cl < x) {
                                w += x - cl;
                                x = cl;
                            }

                            if (ct < y) {
                                h += y - ct;
                                y = ct;
                            }

                            if (cr > w + x)
                                w = cr - x;

                            if (cb > h + y)
                                h = cb - y;

                            cbrt.dispose();
                        }
                    }
                );


                this.bounds.x = x == 0xFFFFFF ? 0 : x;
                this.bounds.y = y == 0xFFFFFF ? 0 : y;
                this.bounds.w = w < 0 ? 0 : w;
                this.bounds.h = h < 0 ? 0 : h;
            },
            onChildUpdate: function() {
                this.update();
            },
            getUnscaledBounds: function() {
                return { x: this.bounds.x, y: this.bounds.y, width: this.bounds.w, height: this.bounds.h };
            }
        }
    );
};

var p = Pyramid.Sprite.prototype = new Pyramid.DisplayObjectContainer;


p.graphics = function() {
    /// <summary>Gets the current graphics context</summary>
    /// <returns type="Pyramid.Graphics">Returns a Pyramid.Graphics instance</returns>
    return $PM(this).graphics;
};

p.contentBounds = function() {
    /// <returns type="Pyramid.Rectangle" />
    var host = $PM(this);
    return new Pyramid.Rectangle(host.bounds.x, host.bounds.y, host.bounds.w, host.bounds.h);
};
