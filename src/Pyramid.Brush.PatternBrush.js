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
/// <reference path="Pyramid.DisplayObject.js" />

Pyramid.Brush.PatternBrush = function(source, repeatX, repeatY) {
    if (this == Pyramid.Brush) return;
    Pyramid.Brush.BrushBase.call(this, arguments);

    $PD
    (
        this,
        {
            $class: Pyramid.Brush.PatternBrush,
            $properties: ["repeatX", "repeatY", "element", "canvasPattern"],
            $notClone: ["source"],
            repeatX: repeatX ? true : false,
            repeatY: repeatY ? true : false,
            source: source,
            last: null,
            lastRep: null,
            lastBounds: null,
            clear: function() {
                this.last = null;
                this.lastRep = null;
                if (this.lastBounds && this.lastBounds.getHashCode) {
                    this.lastBounds.dispose();
                    this.lastBounds = null;
                } else {
                    this.lastBounds = null;
                }
            },
            onBrushUpdate: function() {
                this.clear();
            },
            applyMatrix: function(source, bounds) {
                if (!this.transform2d.isEmpty()) {
                    var isVideo = String(source.tagName).toLowerCase() == "video";
                    var w = isVideo ? source.videoWidth : source.width;
                    var h = isVideo ? source.videoHeight : source.height;
                    var rt = this.transform2d.applyToRectangle(new Pyramid.Rectangle(0, 0, w, h));
                    if (!rt.isEmpty()) {
                        var bhost = $PM(bounds);
                        var x = bhost.x < 0 ? 0 : bhost.x;
                        var y = bhost.y < 0 ? 0 : bhost.y;
                        var c = Pyramid.Object.Globals.Canvas4;
                        var co = Pyramid.Object.Globals.Context42D;
                        c.width = bhost.width + x;
                        c.height = bhost.height + y;
                        co.save();
                        $PM(this.transform2d).apply2D(co, true);
                        x = rt.x();
                        y = rt.y();
                        var xx = x;

                        var minw = bhost.width < w ? bhost.width : w;
                        var minh = bhost.height < h ? bhost.height : h;

                        x %= w;
                        y %= h;

                        if (x > 0) x -= bhost.width;
                        if (y > 0) y -= bhost.height;

                        var xx = x;

                        while (y < bhost.height * 2) {
                            while (x < bhost.width * 2) {
                                co.drawImage(source, x, y);
                                x += minw;
                            }
                            x = xx;
                            y += minh;
                        }


                        co.restore();
                        return c;
                    }
                }
                return source;
            },
            resize: function(source, bounds, resize, repObj) {
                if (resize) {
                    var bhost = $PM(bounds);
                    var isVideo = String(source.tagName).toLowerCase() == "video";
                    var w = isVideo ? source.videoWidth : source.width;
                    var h = isVideo ? source.videoHeight : source.height;
                    if (bhost.width == w && h == bhost.height)
                        return source;
                    var c = Pyramid.Object.Globals.Canvas2;
                    var co = Pyramid.Object.Globals.Context22D;
                    var x = bhost.x < 0 ? 0 : bhost.x;
                    var y = bhost.y < 0 ? 0 : bhost.y;
                    c.width = bhost.width + x;
                    c.height = bhost.height + y;
                    co.save();
                    co.translate(x, y);
                    co.scale(bhost.width / w, bhost.height / h);
                    co.drawImage(source, 0, 0);
                    co.restore();
                    repObj.rep = "no-repeat";
                    return c;
                }
                return source;
            },
            load: function(canvas, context, bounds, resize) {
                if (!this.source) return null;
                var rep = this.repeatX ? this.repeatY ? "repeat" : "repeat-x" : this.repeatY ? "repeat-y" : "no-repeat";
                var src;
                var repObj = { rep: rep };
                var isVideo = false;
                if (!Pyramid.DisplayObject.POF(this.source)) {
                    if (!this.source.tagName || !this.source.attributes) return null;
                    switch (this.source.tagName.toUpperCase()) {
                        case "IMG":
                            break;
                        case "VIDEO":
                            isVideo = true;
                            break;
                        case "CANVAS":
                            if (!this.source.width || !this.source.height)
                                return null;
                            break;
                        default:
                            return null;
                    }
                    try {
                        var sou = this.applyMatrix(this.resize(this.source, bounds, resize, repObj), bounds);
                        if (isVideo) {
                            sou.width = sou.videoWidth;
                            sou.height = sou.videoHeight;
                        }
                        src = context.createPattern(sou, repObj.rep);
                    } catch (err) {
                        try {
                            if (isVideo && this.source.videoWidth) {
                                var c = Pyramid.Object.Globals.getNextCanvas(this.source.videoWidth, this.source.videoHeight);
                                c.context.drawImage(this.source, 0, 0);
                                var sou = this.applyMatrix(this.resize(c.canvas, bounds, resize, repObj), bounds);
                                src = context.createPattern(sou, repObj.rep);
                                c.canvas.width = 0;
                            }
                        } catch (err2) { }
                    }
                } else {
                    var c = Pyramid.Object.Globals.Canvas;
                    var co = Pyramid.Object.Globals.Context2D;
                    if (!this.source.render(c, co))
                        return null;
                    try {
                        src = context.createPattern(this.applyMatrix(this.resize(c, bounds, resize, repObj), bounds), repObj.rep);
                    } catch (err) {
                    }
                }
                this.clear();
                this.last = src;
                this.lastRep = repObj.rep;
                this.lastBounds = bounds.clone();
                return src;
            }
        }
    );
};

var p = Pyramid.Brush.PatternBrush.prototype = new Pyramid.Brush.BrushBase;

p.repeatX = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("repeatX", v);
};

p.repeatY = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("repeatY", v);
};

p.refresh = function() {
    $PM(this).update();
};

p.element = function() {
    return $PM(this).source;
};

p.canvasPattern = function() {
    return $PM(this).last;
};

Pyramid.Brush.ImageBrush = function(src, repeatX, repeatY) {
    if (this == Pyramid.Brush) return;

    var img = document.createElement("img");

    Pyramid.Brush.PatternBrush.call(this, img, repeatX, repeatY);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.Brush.ImageBrush
        }
    );


    function callUpdate() {
        host.update();
    }

    $PAV("error", img, callUpdate);
    $PAV("load", img, callUpdate);
    $PAV("timeupdate", img, callUpdate);

    if (Pyramid.IsFSTR(src)) img.src = src;
};

var p = Pyramid.Brush.ImageBrush.prototype = new Pyramid.Brush.PatternBrush;

Pyramid.Brush.VideoBrush = function(src, repeatX, repeatY) {
    if (this == Pyramid.Brush) return;
    
    var img = document.createElement("video");
    img.style.position = "absolute";
    img.style.left = "-2000px";
    document.body.appendChild(img);

    Pyramid.Brush.PatternBrush.call(this, img, repeatX, repeatY);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.Brush.VideoBrush
        }
    );


    function callUpdate(e) {
        host.update();
    }

    $PAV("error", img, callUpdate);
    $PAV("timeupdate", img, callUpdate);
    $PAV("canplay", img, function() {
        img.muted = true;
        img.play();
        img.initialTime = .5;
    });
    $PAV("ended", img, function() {
        img.play();
    });

    if (Pyramid.IsFSTR(src)) img.src = src;
};

var p = Pyramid.Brush.VideoBrush.prototype = new Pyramid.Brush.PatternBrush;

Pyramid.Brush.HTMLBrush = function(bgColor, bgAlpha, repeatX, repeatY) {
    if (this == Pyramid.Brush) return;

    if (!Pyramid.IsZPNUM(bgColor))
        bgColor = 0xffffff;
    else
        bgColor = bgColor & 0xffffff;

    if (!Pyramid.IsZPNUM(bgAlpha))
        bgAlpha = 1;
    else
        if (bgAlpha > 1) bgAlpha = 1;


    Pyramid.Brush.PatternBrush.call(this, window, repeatX, repeatY);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.Brush.HTMLBrush,
            bgColor: bgColor,
            bgAlpha: bgAlpha,
            load: function(canvas, context, bounds, resize) {
                if (!this.source || !Pyramid.Brush.HTMLBrush.IsAvaible()) return null;
                var e = this.source;
                var w = e.offsetWidth || e.clientWidth || e.innerWidth;
                var h = e.offsetHeight || e.clientHeight || e.innerHeight;

                if (w < 1 || h < 1) return null;

                var rep = this.repeatX ? this.repeatY ? "repeat" : "repeat-x" : this.repeatY ? "repeat-y" : "no-repeat";
                var src;
                var repObj = { rep: rep };
                try {
                    var c = Pyramid.Object.Globals.Canvas;
                    var co = Pyramid.Object.Globals.Context2D;
                    c.width = w;
                    c.height = h;
                    co.drawWindow(this.source, 0, 0, w, h, Pyramid.Object.Globals.getCSSRGBA(this.bgColor, this.bgAlpha));
                    src = context.createPattern(this.resize(c, bounds, resize, repObj), repObj.rep);
                } catch (err) {
                }

                this.clear();
                this.last = src;
                this.lastRep = repObj.rep;
                this.lastBounds = bounds.clone();
                return src;
            }
        }
    );


    function callUpdate(e) {
        host.update();
    }

    if (Pyramid.Brush.HTMLBrush.IsAvaible()) {
        $PAV("domnodechange", window, callUpdate);
        $PAV("resize", window, callUpdate);
        $PAV("load", window, callUpdate);
        $PAV("mozafterpaint", window, callUpdate);
        $PAV("keypress", window, callUpdate);
        $PAV("mouseover", window, callUpdate);
        $PAV("mouseout", window, callUpdate);
        $PAV("mousedown", window, callUpdate);
        $PAV("mouseup", window, callUpdate);
    }

};

Pyramid.Brush.HTMLBrush.IsAvaible = function() {
    if(String(window.location).match(/^http|^file/i))return false;
    return Pyramid.Object.Globals.Context2D.drawWindow ? true : false;
};

var p = Pyramid.Brush.HTMLBrush.prototype = new Pyramid.Brush.PatternBrush;

