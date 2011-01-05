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

var p;

Pyramid.Stage = function(target, width, height, widthAsPercent, heightAsPercent) {
    if (this == Pyramid) return;
    Pyramid.DisplayObjectContainer.call(this);

    width = Number(width);
    height = Number(height);

    if (!Pyramid.IsPNUM(width, height)) {
        width = 300;
        height = 200;
    }

    if (!target)
        target = document.body;

    var c = document.createElement("canvas");
    var c2 = document.createElement("canvas");
    c.width = c2.width = width;
    c.height = c2.height = height;
    if (target)
        target.appendChild(c);


    var stageHost = $PD
    (
        this,
        {
            $class: Pyramid.Stage,
            clearOnRender: true,
            canvas: c,
            context2d: c.getContext("2d"),
            tempc: c2,
            tempContext2d: c2.getContext("2d"),
            frameRate: 1000,
            fps: 0,
            backgroundColor: NaN,
            onChildAdded: function(child, index) {
                $PM(child).addedToStage(this.$);
                this.renderChild(child);
            },
            onChildRemoved: function(child, index) {
                $PM(child).removedFromStage();
            },
            update: function() {
            },
            renderList: [],
            updateHandler: null,
            renderChild: function(child) {
                this.renderList.pushOne(child);
            },
            getUnscaledBounds: function() { return { x: 0, y: 0, width: c.width, height: c.height} },
            render: function() {
                if (this.clearOnRender) {
                    if (isNaN(this.backgroundColor)) {
                        this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    } else {
                        this.context2d.fillStyle = Pyramid.Object.Globals.getCSSRGBA(this.backgroundColor, 1);
                        this.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    }
                }
                //this.tempContext2d.clearRect(0, 0, this.tempc.width, this.tempc.height);
                var drawCanvas = this.canvas;
                var drawContext = this.context2d;
                this.children.forEach
                (
                    function(item) {
                        var x = item.x();
                        var y = item.y();
                        var w = item.width();
                        var h = item.height();
                        if (!item.visible() || w + x <= 0 || h + y <= 0 || x >= drawCanvas.width || y >= drawCanvas.height)
                            return;
                        var itemHost = $PM(item);

                        var c2d = drawContext;
                        c2d.save();

                        c2d.globalAlpha = item.alpha();

                        var ctm = item.currentTransform();

                        $PM(ctm).apply2D(c2d);

                        ctm.dispose();

                        $PM(item.shadow()).apply(drawCanvas, c2d);
                        itemHost.render(drawCanvas, drawContext, 0, 0, w, h);
                        $PM(item.shadow()).reset(drawCanvas, c2d);
                        $PM(item.reflection()).apply(item, drawCanvas, c2d, 0, h, w, h);

                        c2d.restore();

                    },
                    this
                );

                //this.context2d.drawImage(this.tempc, 0, 0);
            }
        }
    );



    function dispatchKeyEvent(type, e) {
        e = e || window.event;
        host.$.dispatchEvent
        (
            new Pyramid.Event.KeyboardEvent
            (
                type,
                true,
                true,
                e.keyCode,
                e.charCode,
                e.metaKey,
                e.altKey,
                e.ctrlKey,
                e.shiftKey
            )
        );
    };

    $PAV("keydown", document, function(e) { dispatchKeyEvent("keyDown", e); });
    $PAV("keyup", document, function(e) { dispatchKeyEvent("keyUp", e); });
    $PAV("keypress", document, function(e) { dispatchKeyEvent("keyPress", e); });

    var ta = document.createElement("textarea");
    with (ta.style) {
        position = "absolute";
        top = "-2000px";
    }
    document.body.appendChild(ta);
    ta.onblur = function() { ta.focus(); };
    ta.focus();

    function updateMouse(e) {
        e = e || window.event;
        //e.preventDefault();
        //e.stopPropagation();
        host.updateMouse(e.type, e.clientX, e.clientY, e.button, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey);
    }

    c.onselectstart = function() { return false; };

    $PAV("mousemove", c, updateMouse);
    $PAV("mousedown", c, updateMouse);
    $PAV("mouseup", c, updateMouse);
    $PAV("click", c, updateMouse);
    $PAV("dblclick", c, updateMouse);

    var last = new Date;
    var host = $PM(this);
    var fpsd = new Date;
    var frameCount = 0;
    var shouldRender = false;
    var totalFrames = 0;

    function doIt() {
        var dt = new Date;
        var diff = Number(dt - last);
        var num = 1000 / host.frameRate;

        if (num <= diff) {
            host.updateTimeline(totalFrames);
            host.$.broadcastEvent(Pyramid.Event.EnterFrameEvent);
            last = dt;
            if (host.renderList.length || shouldRender) {
                if (shouldRender) {
                    host.renderList = host.children.slice();
                }
                host.render();
                host.renderList.length = 0;
                shouldRender = false;
            }
            frameCount++;
            totalFrames++;
            if (totalFrames == Number.MAX_VALUE)
                totalFrames = 0;
            host.$.broadcastEvent(Pyramid.Event.LeaveFrameEvent);
        }

        var diffps = Number(dt - fpsd);
        if (diffps >= 1000) {
            host.fps = Math.ceil(frameCount / (diffps / 1000));
            frameCount = 0;
            fpsd = dt;
        }

        setTimeout(doIt, 1);
    };
    setTimeout(doIt, 1);

    this.resizeStage = function(w, h) {
        if (Pyramid.IsPNUM(w, h)) {
            c.width = c2.width = w;
            c.height = c2.height = h;
            stageHost.render();
        }
    };

    var me = this;

    function onWindowResize() {
        me.resizeStage(target.offsetWidth, target.offsetHeight);
    }

    var resizeOnWindowResize = false;


    this.resizeOnWindowResize = function(v) {
        v = v ? true : false;
        if (resizeOnWindowResize != v) {
            resizeOnWindowResize = v;
            if (v) {
                $PAV("resize", window, onWindowResize);
            } else {
                $PRE("resize", window, onWindowResize);
            }
            onWindowResize();
        }
    };

    this.totalFrames = function() {
        /// <returns type="Number" />
        return totalFrames;
    };
};

Pyramid.Stage.prototype = new Pyramid.DisplayObjectContainer;

p = Pyramid.Stage.prototype;

p.clearOnRender = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("clearOnRender", v);
};

p.fps = function() {
    /// <summary>Returns the current fps (Frames Per Second) rate</summary>
    /// <returns type="Number">Returns current fps</returns>
    return $PM(this).fps;
};
p.frameRate = function(v) {
    /// <summary>Gets or sets the frame rate of current stage</summary>
    /// <param name="v">Optional. If defined, the valid range is 1-1000</param>
    /// <returns type="Number">Returns current frame rate</returns>
    var host = $PM(this);
    if (Pyramid.IsZPNUM(v)) {
        if (v > 1000) v = 1000;
        if (v < 1) v = 1;
        host.frameRate = v;
    }
    return host.frameRate;
};

p.backgroundColor = function(v) {
    /// <returns type="Number" />
    var host = $PM(this);
    if (v != undefined) {
        v = Number(v);
        if (v != host.backgroundColor) {
            host.backgroundColor = v;
            host.update();
        }
    }
    return host.backgroundColor;
};

p.stage = function() {
    /// <summary>This method overloaded. Returns itself</summary>
    /// <returns type="Pyramid.Stage">Returns as Pyramid.Stage</returns>
    return this;
};

p.parent = function() {
    /// <summary>This method overloaded. Returns undefined</summary>
    /// <returns type="undefined">Returns as undefined</returns>
    return undefined;
};

p.width = function() {
    /// <summary>Gets the curent stage width</summary>
    /// <returns type="Number">Returns as number</returns>
    return $PM(this).canvas.width;
};

p.height = function() {
    /// <summary>Gets the curent stage height</summary>
    /// <returns type="Number">Returns as number</returns>
    return $PM(this).canvas.height;
};
p.x = function() {
    /// <returns type="Number">Returns as number</returns>
    return 0;
};

p.y = function() {
    /// <returns type="Number">Returns as number</returns>
    return 0;
};

p.localToParent = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />
    return pt;
};

p.localToGlobal = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />
    return pt;
};

p.parentToLocal = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />
    return pt;
};

p.globalToLocal = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />

    return pt;
};
p.canvasElement = function() {
    return $PM(this).canvas;
};