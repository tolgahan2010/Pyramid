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
/// <reference path="Pyramid.Rectangle.js" />
/// <reference path="Pyramid.Shadow.js" />
/// <reference path="Pyramid.Reflection.js" />
/// <reference path="Pyramid.Matrix2D.js" />
/// <reference path="Pyramid.GraphicsPath.js" />

var p;

/** DisplayObject Begin **/
Pyramid.DisplayObject = function() {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);
    var me = this;
    var timelineObj;
    var notRenderFlag = false;

    var host = $PD
    (
        this,
        {
            $class: Pyramid.DisplayObject,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            parent: null,
            name: "",
            alpha: 1,
            visible: true,
            renderWithStage: true,

            cursor: "default",

            shadow: new Pyramid.Shadow,
            transformMatrix2D: new Pyramid.Matrix2D,
            registerPoint: new Pyramid.Point(0, 0),
            reflection: new Pyramid.Reflection,
            timeline: new Pyramid.Timeline(me),

            getUnscaledBounds: function() { return { x: 0, y: 0, width: 0, height: 0} },
            getUnscaledWidth: function() { return this.getUnscaledBounds().width; },
            getUnscaledHeight: function() { return this.getUnscaledBounds().height; },

            renderingDisabled: false,

            clipRegion: null,

            mouseX: 0,
            mouseY: 0,
            mouseOver: false,
            mouseButton: -1,
            mouseEnabled: true,
            updateMousePosition: function(x, y) {
                this.mouseX = x;
                this.mouseY = y;
            },
            updateMouse: function(type, x, y, btn, ctrl, shift, alt, meta) {
                if (!this.mouseEnabled) return false;
                var pt = new Pyramid.Point(x, y);
                this.$.parentToLocal(pt);
                x = pt.x();
                y = pt.y();
                pt.dispose();

                this.updateMousePosition(x, y);

                var bounds = this.getUnscaledBounds();

                if (bounds.width && bounds.height) {
                    var bx = bounds.x;
                    var by = bounds.y;
                    var r = bounds.width + bx;
                    var b = bounds.height + by;

                    var me = this;

                    function dme(type, trg) {
                        var event = new Pyramid.Event.MouseEvent(type, false, false, x, y, me.mouseButton, ctrl, shift, alt, meta);
                        (trg || me.$).dispatchEvent(event);
                        event.dispose();
                    }

                    if (x >= bx && x < r && y >= by && y < b) {

                        if (type == "mousemove") {

                            if (!this.mouseOver) {
                                this.mouseOver = true;
                                dme("mouseOver");
                            }

                            dme("mouseMove");

                            var stage = this.$.stage();
                            if (stage)
                                stage.canvasElement().style.cursor = this.cursor;
                        } else {
                            switch (type) {
                                case "mousedown":
                                    this.mouseButton = btn;
                                    dme("mouseDown");
                                    break;
                                case "mouseup":
                                    this.mouseButton = -1;
                                    dme("mouseUp");
                                    break;
                                case "click":
                                    this.mouseButton = -1;
                                    dme("click");
                                    break;
                                case "dblclick":
                                    this.mouseButton = -1;
                                    dme("doubleClick");
                                    break;
                            }
                        }


                        if (typeof this.onUpdateMouse == "function")
                            this.onUpdateMouse(type, x, y, btn, ctrl, shift, alt, meta);

                    } else {
                        switch (type) {
                            case "mousemove":
                                if (this.mouseOver) {
                                    this.mouseOver = false;
                                    dme("mouseOut");
                                }
                                break;
                            case "mouseup":
                            case "mousedown":
                            case "click":
                            case "dblclick":
                                if (this.mouseButton) {
                                    this.mouseButton = -1;
                                    dme("mouseUp");
                                    dme("releaseOutside");
                                }
                                break;
                        }
                    }
                }
            },
            calculateBounds: null,
            onUpdateTimeline: function(currentFrame) { },
            updateTimeline: function(currentFrame) {
                timelineObj.process(currentFrame);
                this.onUpdateTimeline(currentFrame);
            },
            onUpdate: function() {
                if (typeof this.calculateBounds == "function")
                    this.calculateBounds();
                if (notRenderFlag)
                    return;
                var stage = this.$.stage();
                if (stage) {
                    $PM(stage).renderChild(this.$);
                }
                if (!this.renderWithStage) this.render(null, null);
            },
            render: function(canvas, context, x, y, w, h) {
                if (!this.renderingDisabled && typeof this.onRender == 'function') {
                    var tf = this.$.stage().totalFrames();
                    if (context) {
                        context.save();
                        if (this.clipRegion) {
                            this.clipRegion.apply(canvas, context, false, false, true);
                        }
                    }
                    var ret = this.onRender(canvas, context, x, y, w, h);
                    if (context) context.restore();
                    return ret;
                }
                return null;
            },
            setParent: function(parent) {
                if (parent) {
                    if (parent != this.parent) {
                        this.parent = parent;
                        if (typeof this.calculateBounds == "function")
                            this.calculateBounds();
                        this.added();
                    }
                } else {
                    if (this.parent) {
                        this.parent = null;
                        this.removed();
                    }
                }
            },
            stage: null,
            onAddedToStage: null,
            addedToStage: function(stage) {
                this.stage = stage;
                if (typeof this.onAddedToStage == 'function')
                    this.onAddedToStage(stage);

                this.$.dispatchEvent(Pyramid.Event.AddedToStage);

                this.onUpdate();
            },
            onRemovedFromStage: null,
            removedFromStage: function() {
                this.stage = null;
                if (typeof this.onRemovedFromStage == 'function')
                    this.onRemovedFromStage();

                this.$.dispatchEvent(Pyramid.Event.RemovedFromStage);
            },

            added: function() {
                this.$.dispatchEvent(Pyramid.Event.Added);
            },

            removed: function() {
                this.$.dispatchEvent(Pyramid.Event.Removed);
            },
            $init: function() {
                var me = this;
                function updateMe() { me.update(); }
                this.shadow.addEventListener("update", updateMe);
                this.transformMatrix2D.addEventListener("update", updateMe);
                this.reflection.addEventListener("update", updateMe);
            }
        }
    );

    timelineObj = $PM(host.timeline);
};

Pyramid.DisplayObject.prototype = new Pyramid.EventDispatcher;

p = Pyramid.DisplayObject.prototype;

p.mask = function(region) {
    /// <param name="region" type="Pyramid.GraphicsPath" />
    var host = $PM(this);
    var needsUpdate = false;
    
    if (host.clipRegion) {
        host.clipRegion.dispose();
        needsUpdate = true;
    }

    if (Pyramid.GraphicsPath.POF(region)) {
        host.clipRegion = $PM(region).compile();
        needsUpdate = true;
    } else {
        host.clipRegion = null;
    }
    if (needsUpdate)
        host.update();
};

p.startDrag = function(dragRect) {
    var stage = this.stage();
    if (stage && stage != this && this.visible()) {
        function dragOperation(control, stage, dragRect) {

            var mx = control.mouseX(), my = control.mouseY();
            if (stage.lastDragOperation) {
                stage.lastDragOperation.stop();
            }

            var parent = control.parent();
            var childIndex = parent.getChildIndex(control);
            if (parent != stage) {
                var pt = new Pyramid.Point(control.x(), control.y());
                parent.localToGlobal(pt);
                parent.removeChildAt(childIndex);
                stage.addChild(control);
                control.move(pt.x() + 15, pt.y() + 15);
                pt.dispose();
            }

            if (Pyramid.Rectangle.POF(dragRect))
                dragRect = dragRect.clone();
            else
                dragRect = new Pyramid.Rectangle(0, 0, stage.width() - control.width(), stage.height() - control.height());

            var rectHost = $PM(dragRect);

            function move() {
                var xx = stage.mouseX() - mx;
                var yy = stage.mouseY() - my;

                var tmp;

                if (xx < rectHost.x) xx = rectHost.x;
                else if (xx >= (tmp = rectHost.x + rectHost.width)) xx = tmp;

                if (yy < rectHost.y) yy = rectHost.y;
                else if (yy >= (tmp = rectHost.y + rectHost.height)) yy = tmp;

                control.move(xx, yy);
            }

            function removedFromStage() {
                me.stop();
            }

            var me = this;
            stage.addEventListener("mouseMove", move);
            stage.addEventListener("removedFromStage", removedFromStage);
            stage.lastDragOperation = this;

            $PM(stage).mouseChildren = false;

            this.control = control;
            this.stop = function() {
                $PM(stage).mouseChildren = true;
                stage.removeEventListener("mouseMove", move);
                stage.removeEventListener("removedFromStage", removedFromStage);
                if (parent != stage) {
                    var pt = new Pyramid.Point(control.x(), control.y());
                    stage.removeChild(control);
                    parent.globalToLocal(pt);
                    control.move(pt.x() - 15, pt.y() - 15);
                    pt.dispose();
                    parent.addChild(control, childIndex);
                }
                stage.lastDragOperation = null;
                dragRect.dispose();
                x = null;
                y = null;
                control = null;
                stage = null;
                parent = null;
                rectHost = null;
                delete me.control;
                delete me.stop;
                me = null;
            };
        }

        new dragOperation(this, stage, dragRect);
    }
};

p.stopDrag = function() {
    var stage = this.stage();
    if (stage) {
        if (stage.lastDragOperation && stage.lastDragOperation.control == this)
            stage.lastDragOperation.stop();
    }
};

p.mouseEnabled = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("mouseEnabled", v, true);
};

p.cursor = function(v) {
    /// <returns type="String" />
    return $PM(this)._setzstr("cursor", v, true);
};

p.mouseX = function() {
    /// <returns type="Number" />
    return $PM(this).mouseX;
};

p.mouseY = function() {
    /// <returns type="Number" />
    return $PM(this).mouseY;
};

p.hasMouse = function() {
    /// <returns type="Boolean" />
    return $PM(this).mouseOver;
};

p.mouseButton = function() {
    /// <returns type="Number" />
    return $PM(this).mouseButton;
};

p.scrollBy = function(x, y) {
    $PM(this)._incs("scrollX", x, "scrollY", y);
};

p.scrollTo = function(x, y) {
    $PM(this)._setnums("scrollX", x, "scrollY", y);
};

p.scrollReset = function() {
    this.scrollTo(0, 0);
};

p.scrollX = function(v) {
    return $PM(this)._setnum("scrollX", v);
};

p.scrollXBy = function(v) {
    return $PM(this)._inc("scrollX", v);
};

p.scrollY = function(v) {
    return $PM(this)._setnum("scrollY", v);
};

p.scrollYBy = function(v) {
    return $PM(this)._inc("scrollY", v);
};

p.shadow = function() {
    /// <returns type="Pyramid.Shadow" />
    return $PM(this).shadow;
};

p.reflection = function() {
    /// <returns type="Pyramid.Reflection" />
    return $PM(this).reflection;
};

p.transformMatrix2D = function() {
    /// <returns type="Pyramid.Matrix2D" />
    return $PM(this).transformMatrix2D;
};

p.currentTransform = function(withoutTranslation) {
    /// <returns type="Pyramid.Matrix2D" />
    var m = new Pyramid.Matrix2D;
    var mhost = $PM(m);
    var cphost = $PM(this.registerPoint());

    mhost.appendTranslate(-cphost.x, -cphost.y);

    mhost.appendScale(this.scaleX(), this.scaleY());
    mhost.appendRotate(Math.toRadian(this.rotation()));

    if (!withoutTranslation)
        mhost.appendTranslate(this.x(), this.y());

    mhost.append.apply(mhost, this.transformMatrix2D().data());
    mhost.appendTranslate(this.scrollX(), this.scrollY());

    mhost.appendTranslate(cphost.x, cphost.y);

    return m;
};

p.registerPoint = function() {
    /// <returns type="Pyramid.Point" />
    return $PM(this).registerPoint;
};

p.stageWidth = function() {
    /// <returns type="Number" />
    var s = this.stage();
    if (s) return s.width();
    return 0;
};

p.stageHeight = function() {
    /// <returns type="Number" />
    var s = this.stage();
    if (s) return s.height();
    return 0;
};

p.visible = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("visible", v);
};

p.renderWithStage = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("renderWithStage", v);
};

p.alpha = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setalpha("alpha", v);
};

p.alphaBy = function(v) {
    /// <returns type="Number" />
    return $PM(this)._incalpha("alpha", v);
};

p.scaleX = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("scaleX", v);
};
p.scaleXBy = function(v) {
    /// <returns type="Number" />
    return $PM(this)._inc("scaleX", v);
};
p.scaleY = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("scaleY", v);
};
p.scaleYBy = function(v) {
    /// <returns type="Number" />
    return $PM(this)._inc("scaleY", v);
};
p.scale = function(x, y) {
    /// <returns type="Pyramid.DisplayObject" />
    return $PM(this)._setnums("scaleX", x, "scaleY", y);
};

p.scaleBy = function(x, y) {
    /// <returns type="Pyramid.DisplayObject" />
    return $PM(this)._incs("scaleX", x, "scaleY", y);
};

p.rotation = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("rotation", v);
};
p.rotationBy = function(v) {
    /// <returns type="Number" />
    return $PM(this)._inc("rotation", v);
};

p.x = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("x", v);
};
p.xBy = function(v) {
    /// <returns type="Number" />
    return $PM(this)._inc("x", v);
};
p.y = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("y", v);
};
p.yBy = function(v) {
    /// <returns type="Number" />
    return $PM(this)._inc("y", v);
};
p.move = function(x, y) {
    /// <returns type="Pyramid.DisplayObject" />
    return $PM(this)._setnums("x", x, "y", y);
};
p.moveBy = function(x, y) {
    /// <returns type="Pyramid.DisplayObject" />
    return $PM(this)._incs("x", x, "y", y);
};
p.width = function(v) {
    /// <returns type="Number" />
    var host = $PM(this);
    var w = host.getUnscaledWidth();
    var sw = w * host.scaleX;
    if (Pyramid.IsNUM(v) && v != sw) {
        this.scaleX(v / sw);
    }
    var t = host.scaleX;
    return w * (t < 0 ? -t : t);
};
p.height = function(v) {
    /// <returns type="Number" />
    var host = $PM(this);
    var h = host.getUnscaledHeight();
    var sh = h * host.scaleY;
    if (Pyramid.IsNUM(v) && v != sh) {
        this.scaleY(v / sh);
    }
    var t = host.scaleY;
    return h * (t < 0 ? -t : t);
};
p.parent = function() {
    /// <returns type="Pyramid.DisplayObjectContainer" />
    return $PM(this).parent;
};
p.stage = function() {
    var host = $PM(this);
    return host.stage;
};
p.name = function(v) {
    return $PM(this)._setzstr("name", v);
};

p.bounds = function() {
    /// <return type="Pyramid.Rectangle" />
    var b = $PM(this).getUnscaledBounds();
    return new Pyramid.Rectangle(b.x, b.y, b.width, b.height);
};

p.globalBounds = function() {
    var b = this.bounds();
    return this.localToGlobalRect(b);
};

p.transformedBounds = function() {
    /// <return type="Pyramid.Rectangle" />
    /*
    var host = $PM(this);
    var m = new Pyramid.Matrix2D;
    var mhost = $PM(m);
    var cphost = $PM(host.registerPoint);
    mhost.appendRotateOn(Math.toRadian(host.rotation), cphost.x, cphost.y);
    mhost.appendScale(host.scaleX, host.scaleY);
    mhost.appendTranslate(host.x, host.y);
    mhost.append.apply(mhost, $PM(host.transformMatrix2D).data);
    mhost.appendTranslate(host.scrollX, host.scrollY);
    */

    var host = $PM(this);
    var bounds = host.getUnscaledBounds();
    var m = this.currentTransform();
    var rt = m.applyToXYWH(bounds.x, bounds.y, bounds.width, bounds.height);
    m.dispose();
    return rt;
};

p.localToParent = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />
    var t = this.currentTransform();
    t.applyToPoint(pt);
    t.dispose();

    return pt;

};


p.localToGlobal = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />
    var p = this;
    while (p) {
        p.localToParent(pt);
        p = p.parent();
    }
    return pt;
};

p.localToGlobalRect = function(rt) {
    var pt1 = rt.topLeft();
    var pt2 = rt.bottomRight();
    this.localToGlobal(pt1);
    this.localToGlobal(pt2);
    rt.position(pt1.x(), pt1.y());
    rt.size(pt2.x() - pt1.x(), pt2.y() - pt1.y());
    pt1.dispose();
    pt2.dispose();
    return rt;
};

p.parentToLocal = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />

    var t = this.currentTransform();
    t.invert();
    t.applyToPoint(pt);
    t.dispose();

    return pt;
};

p.globalToLocal = function(pt) {
    /// <param name="pt" type="Pyramid.Point" />
    /// <returns type="Pyramid.Point" />
    

    var list = [this];

    var p = this.parent();
    while (p) {
        list.unshift(p);
        p = p.parent();
    }

    list.forEach
    (
        function(item) {
            item.parentToLocal(pt);
        }
    );

    return pt;
};

p.timeline = function() {
    ///<returns type="Pyramid.Timeline" />
    return $PM(this).timeline;
};


/* EVENTS */

p.enterFrame = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "enterFrame", handler);
};

p.addedToStage = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "addedToStage", handler);
};

p.removedFromStage = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "removedFromStage", handler);
};

p.added = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "added", handler);
};

p.removed = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "removed", handler);
};

p.click = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "click", handler);
};

p.doubleClick = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "doubleClick", handler);
};

p.mouseDown = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "mouseDown", handler);
};

p.mouseUp = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "mouseUp", handler);
};

p.mouseOver = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "mouseOver", handler);
};

p.mouseOut = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "mouseOut", handler);
};

p.mouseMove = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "mouseMove", handler);
};

p.keyDown = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "keyDown", handler);
};

p.keyUp = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "keyUp", handler);
};

p.keyPress = function(handler, bRemove) {
    var f = bRemove ? this.removeEventListener : this.addEventListener;
    f.call(this, "keyPress", handler);
};



/** DisplayObject End **/
