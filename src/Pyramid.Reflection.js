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

Pyramid.Reflection = function() {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);
    var host = $PD
    (
        this,
        {
            enabled: false,
            startAlpha: .4,
            endAlpha: 0,
            ratio: .85,
            scaleY: 1,
            scaleX: 1,
            offsetX: 0,
            offsetY: 0,
            apply: function(child, canvas, context, x, y, w, h) {
                if (this.enabled && this.ratio && this.scaleY && this.scaleX && (this.startAlpha > 0 || this.endAlpha > 0)) {
                    
                    context.save();

                    context.translate(x, y);

                    w *= this.scaleX;
                    h *= this.scaleY;

                    var dst = Pyramid.Object.Globals.getNextCanvas(w, h);
                    var src = Pyramid.Object.Globals.getNextCanvas(w, h);

                    with (src.context) {
                        save();
                        translate(0, h);
                        scale(this.scaleX, -this.scaleY);
                        $PM(child).render(src.canvas, src.context, 0, 0, w, h);
                        restore();
                    }

                    with (dst.context) {
                        save();

                        drawImage(src.canvas, 0, 0);
                        var g = createLinearGradient(0, 0, 0, h);
                        g.addColorStop(0, Pyramid.Object.Globals.getCSSRGBA(0, this.startAlpha));
                        g.addColorStop(this.ratio, Pyramid.Object.Globals.getCSSRGBA(0, this.endAlpha));

                        globalCompositeOperation = "source-in";
                        fillStyle = g;
                        fillRect(0, 0, w, h);

                        globalCompositeOperation = "source-atop";
                        drawImage(src.canvas, 0, 0);
                        
                        restore();
                    }

                    context.drawImage(dst.canvas, this.offsetX, this.offsetY);

                    context.restore();
                }
            }
        }
    );
};

var p = Pyramid.Reflection.prototype = new Pyramid.EventDispatcher;

p.enabled = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("enabled", v);
};
p.startAlpha = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("startAlpha", v);
};
p.endAlpha = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("endAlpha", v);
};
p.ratio = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("ratio", v);
};
p.scaleX = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setzpnum("scaleX", v);
};
p.scaleY = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setzpnum("scaleY", v);
};
p.offsetX = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("offsetX", v);
};
p.offsetY = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("offsetY", v);
};
p.setParams = function(enabled, startAlpha, endAlpha, ratio, scaleX, scaleY, offsetX, offsetY) {
    this.lockUpdate();
    this.enabled(enabled);
    this.startAlpha(startAlpha);
    this.endAlpha(endAlpha);
    this.ratio(ratio);
    this.scaleX(scaleX);
    this.scaleY(scaleY);
    this.offsetX(offsetX);
    this.offsetY(offsetY);
    this.unlockUpdate();
};