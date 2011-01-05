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
/// <reference path="Pyramid.Font.js" />
/// <reference path="Pyramid.Graphics.js" />
/// <reference path="Pyramid.TextFormat.js" />
/// <reference path="Pyramid.Brush.SolidBrush.js" />
/// <reference path="Pyramid.Sprite.js" />


Pyramid.UI = {};

Pyramid.UI.Align =
{
    near: "near",
    center: "center",
    far: "far"
};

Pyramid.UI.Label = function() {
    if (this == Pyramid.UI) return;
    Pyramid.DisplayObject.call(this);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.Label,
            font: new Pyramid.Font,
            format: new Pyramid.TextFormat,
            graphics: new Pyramid.Graphics,
            brush: new Pyramid.Brush.SolidBrush,
            hGraph: null,
            text: "",
            bounds: null,
            renderFlag: true,
            onRender: function(canvas, context, x, y, w, h) {
                if (this.bounds) {
                    this.hGraph.render(canvas, context);
                    return this.bounds.ret;
                }
                return null;
            },
            calculateBounds: function() {
                this.hGraph.dispose();
                this.hGraph.selectBrush(this.brush);
                this.hGraph.drawTextLine(this.text, 0, 0, this.font, this.format);
                var ret = this.hGraph.canDraw();
                if (ret) {
                    this.bounds = { x: 0, y: 0, width: ret.maxw, height: ret.maxh, ret: ret };
                } else {
                    this.bounds = null;
                }
            },

            getUnscaledBounds: function() {
                return this.bounds ?
                        { x: this.bounds.x, y: this.bounds.y, width: this.bounds.width, height: this.bounds.height} :
                        { x: 0, y: 0, width: 0, height: 0 };
            },

            $init: function() {
                this.hGraph = $PM(this.graphics);
                function update() { host.renderFlag = true; host.update(); }
                this.font.addEventListener("update", update);
                this.format.addEventListener("update", update);
                this.brush.addEventListener("update", update);
            }
        }
    );

    var old = host._setzstr;
    host._setzstr = function() {
        host.renderFlag = true;
        old.apply(host, arguments);
    };
};

var p = Pyramid.UI.Label.prototype = new Pyramid.DisplayObject;

p.text = function(v) {
    /// <returns type="String" />
    return $PM(this)._setzstr("text", v);
};

p.brush = function() {
    /// <returns type="Pyramid.Brush.SolidBrush" />
    return $PM(this).brush;
};

p.font = function() {
    /// <returns type="Pyramid.Font" />
    return $PM(this).font;
};

p.format = function() {
    /// <returns type="Pyramid.TextFormat" />
    return $PM(this).format;
};


Pyramid.UI.BitmapLabel = function() {
    if (this == Pyramid.UI) return;
    Pyramid.UI.Label.call(this);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.BitmapLabel,
            text: "",
            context: null,
            onRender: function(canvas, context, x, y, w, h) {
                if (this.context && this.bounds) {
                    context.drawImage(this.context.canvas, 0, 0);
                    return this.bounds.ret;
                }
                return null;
            },
            calculateBounds: function() {
                if (!this.renderFlag && this.bounds)
                    return;

                this.hGraph.dispose();
                this.hGraph.selectBrush(this.brush);
                this.hGraph.drawTextLine(this.text, 0, 0, this.font, this.format);
                var ret = this.hGraph.canDraw();
                if (ret) {
                    this.bounds = { x: 0, y: 0, width: ret.maxw, height: ret.maxh, ret: ret };
                    if (ret.maxw && ret.maxh) {
                        if (!this.context) {
                            var c = document.createElement("canvas");
                            this.context = c.getContext("2d");
                        }
                        var cnv = this.context.canvas;
                        cnv.width = ret.maxw + this.font.size();
                        cnv.height = ret.maxh;
                        this.hGraph.render(cnv, this.context);
                    } else {
                        if (this.context) {
                            this.context.canvas.width = 0;
                            this.context = null;
                        }
                    }
                } else {
                    this.bounds = null;
                    if (this.context) {
                        this.context.canvas.width = 0;
                        this.context = null;
                    }
                }
                this.hGraph.dispose();
                this.renderFlag = false;
            }
        }
    );
};

Pyramid.UI.BitmapLabel.prototype = new Pyramid.UI.Label;


Pyramid.UI.Margin = function(left, top, right, bottom, width, height) {
    if (this == Pyramid.UI) return;
    Pyramid.EventDispatcher.call(this, arguments);

    function calcUnit(unit, max) {
        if (!unit || unit == "")
            return Number.NaN;

        var hasP = unit.indexOf("%") > -1;
        if (hasP) unit = unit.replace("%", "");

        var num = Number(unit);
        if (isNaN(num))
            return Number.NaN;

        if (hasP)
            return max * num * .01;

        return num;
    }

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.Margin,
            $properties: ["left", "top", "right", "bottom"],
            left: null,
            top: null,
            right: null,
            bottom: null,
            width: null,
            height: null,
            calcUnit: function(name, t) {
                return calcUnit(this[name], t);
            },
            getBounds: function(current, x, y, w, h) {
                var p = current.parent();
                if (p) {

                    var pw = p.width();
                    var ph = p.height();

                    var l = calcUnit(this.left, pw);
                    var r = calcUnit(this.right, pw);
                    var t = calcUnit(this.top, ph);
                    var b = calcUnit(this.bottom, ph);
                    var _w = calcUnit(this.width, pw);
                    var _h = calcUnit(this.height, ph);

                    var hl = !isNaN(l),
                        hr = !isNaN(r),
                        ht = !isNaN(t),
                        hb = !isNaN(b),
                        hw = !isNaN(_w),
                        hh = !isNaN(_h);

                    if (hl && hr) {
                        x = l;
                        w = pw - r - l;
                    } else if (hl) {
                        x = l;
                    } else if (hr) {
                        x = pw - r;
                    }

                    if (ht && hb) {
                        y = t;
                        h = ph - b - t;
                    } else if (ht) {
                        y = t;
                    } else if (hb) {
                        y = ph - b;
                    }

                    if (hw) w = _w;
                    if (hh) {
                        h = _h;
                    }
                    if (w < 0) w = 0;
                    if (h < 0) h = 0;
                }

                return { x: x, y: y, width: w, height: h };
            },
            getValues: function(w, h) {

                var l = calcUnit(this.left, w) || 0;
                var r = calcUnit(this.right, w) || 0;
                var t = calcUnit(this.top, h) || 0;
                var b = calcUnit(this.bottom, h) || 0;
                var _w = calcUnit(this.width, w) || 0;
                var _h = calcUnit(this.height, h) || 0;

                return { l: l, t: t, r: r, b: b, w: _w, h: _h };
            }
        }
    );

    host._setzstr("left", left, true);
    host._setzstr("top", top, true);
    host._setzstr("right", right, true);
    host._setzstr("bottom", bottom, true);
    host._setzstr("width", width, true);
    host._setzstr("height", height, true);
};

var p = Pyramid.UI.Margin.prototype = new Pyramid.EventDispatcher;

p.left = function(v) {
    /// <returns type="string" />
    return $PM(this)._setzstr("left", v);
};

p.top = function(v) {
    /// <returns type="string" />
    return $PM(this)._setzstr("top", v);
};

p.right = function(v) {
    /// <returns type="string" />
    return $PM(this)._setzstr("right", v);
};

p.bottom = function(v) {
    /// <returns type="string" />
    return $PM(this)._setzstr("bottom", v);
};

p.width = function(v) {
    /// <returns type="string" />
    return $PM(this)._setzstr("width", v);
};

p.height = function(v) {
    /// <returns type="string" />
    return $PM(this)._setzstr("height", v);
};

p.all = function(v) {
    this.lockUpdate();
    this.left(v);
    this.top(v);
    this.right(v);
    this.bottom(v);
    this.width("");
    this.height("");
    this.unlockUpdate();
};

Pyramid.UI.Rect = function(margin, brush, pen, resizeBrush, resizePen) {
    if (this == Pyramid.UI) return;
    Pyramid.DisplayObject.call(this, arguments);
    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.Rect,
            margin: null,
            brush: null,
            pen: null,
            allUpdate: function() {
                host.update();
            },
            onRender: function(canvas, context, x, y, w, h) {
                if (this.margin && (this.brush || this.pen)) {
                    var bounds = this.getUnscaledBounds();
                    var rectBounds = new Pyramid.Rectangle(0, 0, bounds.width, bounds.height);
                    if (this.brush) {
                        $PM(this.brush).apply(canvas, context, rectBounds, resizeBrush);
                        context.fillRect(0, 0, bounds.width, bounds.height);
                    }
                    if (this.pen) {
                        $PM(this.pen).apply(canvas, context, rectBounds, resizePen);
                        context.strokeRect(0, 0, bounds.width, bounds.height);
                    }
                    rectBounds.dispose();
                    return bounds;
                }
                return null;
            },
            getUnscaledBounds: function() {
                if (this.margin) {
                    return $PM(this.margin).getBounds(this.$, 0, 0, 0, 0);
                }
                return { x: 0, y: 0, width: 0, height: 0 };
            },
            calculateBounds: function() {
                var p = this.$.parent();
                if (p && this.margin) {
                    var mhost = $PM(this.margin);
                    var pw = p.width();
                    var ph = p.height();

                    var l = mhost.calcUnit("left", pw);
                    var t = mhost.calcUnit("top", pw);
                    var r = mhost.calcUnit("right", ph);
                    var b = mhost.calcUnit("bottom", ph);

                    if (!isNaN(l) || !isNaN(r))
                        this.lockedProperties.pushOne("x");
                    else
                        this.lockedProperties.remove("x");

                    if (!isNaN(t) || !isNaN(b))
                        this.lockedProperties.pushOne("y");
                    else
                        this.lockedProperties.remove("y");

                    var bounds = mhost.getBounds(this.$, 0, 0, 0, 0);

                    this.x = bounds.x;
                    this.y = bounds.y;

                }
            }
        }
    );

    this.lockUpdate();
    this.margin(margin);
    this.brush(brush);
    this.pen(pen);
    this.unlockUpdate();

};
var p = Pyramid.UI.Rect.prototype = new Pyramid.DisplayObject;
p.margin = function(v) {
    /// <returns type="Pyramid.UI.Margin" />
    var host = $PM(this);
    if (Pyramid.UI.Margin.POF(v)) {
        if (v != host.margin) {
            if (host.margin)
                host.margin.removeEventListener("update", host.allUpdate);
            host.margin = v;
            if (v)
                v.addEventListener("update", host.allUpdate);

            host.allUpdate();
        }
    }
    return host.margin;
};
p.brush = function(v) {
    /// <returns type="Pyramid.UI.Margin" />
    var host = $PM(this);
    if (Pyramid.Brush.BrushBase.POF(v)) {
        if (v != host.brush) {
            if (host.brush)
                host.brush.removeEventListener("update", host.allUpdate);
            host.brush = v;
            if (v)
                v.addEventListener("update", host.allUpdate);

            host.allUpdate();
        }
    }
    return host.brush;
};

p.pen = function(v) {
    /// <returns type="Pyramid.UI.Margin" />
    var host = $PM(this);
    if (Pyramid.Pen.POF(v)) {
        if (v != host.pen) {
            if (host.pen)
                host.pen.removeEventListener("update", host.allUpdate);
            host.pen = v;
            if (v)
                v.addEventListener("update", host.allUpdate);

            host.allUpdate();
        }
    }
    return host.pen;
};

Pyramid.UI.Control = function() {
    if (this == Pyramid.UI) return;
    Pyramid.Sprite.call(this, arguments);
    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.Control,
            margin: null,
            marginUpdate: function() {
                host.update();
            },
            getAbsoluteBounds: function() {
                if (this.margin) {
                    return $PM(this.margin).getBounds(this.$, 0, 0, 0, 0);
                }
                return { x: 0, y: 0, width: 0, height: 0 };
            },
            getUnscaledBounds: function() {
                if (this.margin) {
                    return $PM(this.margin).getBounds(this.$, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
                }
                return { x: this.bounds.x, y: this.bounds.y, width: this.bounds.w, height: this.bounds.h };
            },
            validateMargin: function() {
                var p = this.$.parent();
                if (p && this.margin) {
                    var mhost = $PM(this.margin);
                    var pw = p.width();
                    var ph = p.height();

                    var l = mhost.calcUnit("left", pw);
                    var t = mhost.calcUnit("top", pw);
                    var r = mhost.calcUnit("right", ph);
                    var b = mhost.calcUnit("bottom", ph);

                    if (!isNaN(l) || !isNaN(r))
                        this.lockedProperties.pushOne("x");
                    else
                        this.lockedProperties.remove("x");

                    if (!isNaN(t) || !isNaN(b))
                        this.lockedProperties.pushOne("y");
                    else
                        this.lockedProperties.remove("y");

                    var bounds = mhost.getBounds(this.$, 0, 0, 0, 0);

                    this.x = bounds.x;
                    this.y = bounds.y;

                }
            }
        }
    );
    var oldCalc = host.calculateBounds;

    host.calculateBounds = function() {
        this.validateMargin();
        oldCalc.call(this);
    };
};

var p = Pyramid.UI.Control.prototype = new Pyramid.Sprite;

p.margin = function(v) {
    /// <returns type="Pyramid.UI.Margin" />
    var host = $PM(this);
    if (Pyramid.UI.Margin.POF(v)) {
        if (v != host.margin) {
            if (host.margin)
                host.margin.removeEventListener("update", host.marginUpdate);
            host.margin = v;
            if (v)
                v.addEventListener("update", host.marginUpdate);

            host.marginUpdate();
        }
    }
    return host.margin;
};

p.clearMargin = function() {
    /// <returns type="Pyramid.UI.Margin" />
    var host = $PM(this);
    var p = host.margin;
    if (host.margin) {
        host.margin.removeEventListener("update", host.marginUpdate);
        host.margin = null;
    }
    return p;
};




Pyramid.UI.ContainerControl = function() {
    if (this == Pyramid.UI) return;
    Pyramid.UI.Control.call(this, arguments);

    var container = new Pyramid.Sprite;
    var containerHost = $PM(container);
    containerHost.childParentProxy = this;

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.ContainerControl,
            container: container,
            padding: null,
            paddingUpdate: function() {
                host.update();
            },
            onCalculateBounds: null,
            calculateBounds: function() {

                this.validateMargin();

                if (typeof this.onCalculateBounds == "function") {
                    containerHost.freezeUpdate(true);
                    this.onCalculateBounds();
                    containerHost.freezeUpdate(false);
                }

                var x = 0xFFFFFF, y = 0xFFFFFF, w = -0xFFFFFF, h = -0xFFFFFF;

                var g = $PM(this.graphics);
                if (g.bounds) {
                    var b = $PM(g.bounds);

                    x = b.x;
                    y = b.y;
                    w = b.width;
                    h = b.height;
                }

                var cbounds = containerHost.getUnscaledBounds();

                if (w < cbounds.width)
                    w = cbounds.width;
                if (h < cbounds.height)
                    h = cbounds.height;


                containerHost.x = containerHost.y = 0;

                if (this.padding) {
                    var phost = $PM(this.padding);
                    var values = phost.getValues(w, h);

                    if (values.l < 0)
                        values.l = 0;

                    if (values.t < 0)
                        values.t = 0;

                    if (values.r < 0)
                        values.r = 0;

                    if (values.b < 0)
                        values.b = 0;

                    containerHost.x = values.l;
                    containerHost.y = values.t;

                    var tmp = cbounds.width + values.r;
                    if (tmp < w) w = tmp;

                    tmp = cbounds.height + values.b;
                    if (tmp < h) h = tmp;
                }


                if (x > 0)
                    x = 0;

                if (y > 0)
                    y = 0;


                this.bounds.x = x;
                this.bounds.y = y;
                this.bounds.w = w < 0 ? 0 : w;
                this.bounds.h = h < 0 ? 0 : h;

            },
            getAbsoluteContentBounds: function() {
                var bounds = this.getAbsoluteBounds();
                if (this.padding) {
                    var phost = $PM(this.padding);
                    var values = phost.getValues(bounds.width, bounds.height);
                    if (values.l < 0) values.l = 0;
                    if (values.t < 0) values.t = 0;
                    if (values.r < 0) values.r = 0;
                    if (values.b < 0) values.b = 0;
                    var pw = values.l + values.r;
                    var ph = values.t + values.b;
                    bounds.width -= pw;
                    if (bounds.width < 0) bounds.width = 0;
                    bounds.height -= ph;
                    if (bounds.height < 0) bounds.height = 0;
                }
                return bounds;
            }
        }
    );

    container.addEventListener("update", function() { host.update(); });
    host.children.push(container);

    this.getObjectsUnderPoint = function() { return container.getObjectsUnderPoint.apply(container, arguments); };
    this.setChildIndex = function() { return container.setChildIndex.apply(container, arguments); };
    this.getChildIndex = function() { return container.getChildIndex.apply(container, arguments); };
    this.getChildByName = function() { return container.getChildByName.apply(container, arguments); };
    this.swapChildren = function() { return container.swapChildren.apply(container, arguments); };
    this.swapChildrenAt = function() { return container.swapChildrenAt.apply(container, arguments); };
    this.getChildAt = function() { return container.getChildAt.apply(container, arguments); };
    this.contains = function() { return container.contains.apply(container, arguments); };
    this.removeAllChildren = function() { return container.removeAllChildren.apply(container, arguments); };
    this.removeChild = function() { return container.removeChild.apply(container, arguments); };
    this.removeChildAt = function() { return container.removeChildAt.apply(container, arguments); };
    this.numChildren = function() { return container.numChildren.apply(container, arguments); };
    this.addChild = function() { return container.addChild.apply(container, arguments); };

};

var p = Pyramid.UI.ContainerControl.prototype = new Pyramid.UI.Control;

p.padding = function(v) {
    /// <returns type="Pyramid.UI.Margin" />
    var host = $PM(this);
    if (Pyramid.UI.Margin.POF(v)) {
        if (v != host.padding) {
            if (host.padding)
                host.padding.removeEventListener("update", host.paddingUpdate);
            host.padding = v;
            v.addEventListener("update", host.paddingUpdate);
            host.paddingUpdate();
        }
    }
    return host.padding;
};
p.clearPadding = function() {
    /// <returns type="Pyramid.UI.Margin" />
    var host = $PM(this);
    var p = host.padding;
    if (host.padding) {
        host.padding.removeEventListener("update", host.paddingUpdate);
        host.padding = null;
    }
    return p;
};


Pyramid.UI.LayoutBase = function() {
    if (this == Pyramid.UI) return;
    Pyramid.EventDispatcher.call(this, arguments);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.LayoutBase,
            process: function(children, width, height) {
            }
        }
    );
};

var p = Pyramid.UI.LayoutBase.prototype = new Pyramid.EventDispatcher;


Pyramid.UI.AlignedLayout = function(gap, hAlign, vAlign) {
    if (this == Pyramid.UI) return;
    Pyramid.UI.LayoutBase.call(this, arguments);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.AlignedLayout,
            gap: 0,
            hAlign: "near",
            vAlign: "near",
            processChildren: function(children, width, height, maxWidth, maxHeight, totalWidth, totalHeight) {
            },
            process: function(children, width, height) {
                var maxWidth = 0;
                var maxHeight = 0;
                var totalWidth = 0;
                var totalHeight = 0;
                if (this.hAlign != "near" || this.vAlign != "near") {
                    children.forEach
                    (
                        function(child) {
                            if (child.visible()) {
                                var ww = child.width();
                                var hh = child.height();
                                totalWidth += ww;
                                totalHeight += hh;
                                if (ww > maxWidth) maxWidth = ww;
                                if (hh > maxHeight) maxHeight = hh;
                            }
                        },
                        this
                    );
                }

                this.processChildren(children, width, height, maxWidth, maxHeight, totalWidth, totalHeight);

            }
        }
    );

    host._setv("hAlign", hAlign, Pyramid.UI.Align, true);
    host._setv("vAlign", vAlign, Pyramid.UI.Align, true);
    host._setnum("gap", gap, true);
};

var p = Pyramid.UI.AlignedLayout.prototype = new Pyramid.UI.LayoutBase;

p.gap = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("gap", v);
};

p.hAlign = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("hAlign", v, Pyramid.UI.Align);
};

p.vAlign = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("vAlign", v, Pyramid.UI.Align);
};



Pyramid.UI.HorizontalLayout = function(gap, hAlign, vAlign) {
    if (this == Pyramid.UI) return;
    Pyramid.UI.AlignedLayout.call(this, gap, hAlign, vAlign);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.HorizontalLayout,
            processChildren: function(children, width, height, maxWidth, maxHeight, totalWidth, totalHeight) {
                if (width == 0) width = totalWidth;
                if (height == 0) height = maxHeight;
                var startX = 0;
                var gap = this.gap;
                totalWidth += (children.length - 1) * gap;
                switch (this.hAlign) {
                    case "center":
                        startX = (width - totalWidth) * .5;
                        break;
                    case "far":
                        startX = width - totalWidth;
                        break;
                }


                switch (this.vAlign) {
                    case "near":
                        children.forEach
                        (
                            function(child) {
                                if (!child.visible()) return;
                                child.x(startX);
                                startX += child.width() + gap;
                            }
                        );
                        break;
                    case "center":
                        children.forEach
                        (
                            function(child) {
                                if (!child.visible()) return;
                                var y = (height - child.height()) * .5;
                                child.move(startX, y);
                                startX += child.width() + gap;
                            }
                        );
                        break;
                    case "far":
                        children.forEach
                        (
                            function(child) {
                                if (!child.visible()) return;
                                var y = (height - child.height());
                                child.move(startX, y);
                                startX += child.width() + gap;
                            }
                        );
                        break;
                }
            }
        }
    );
};

var p = Pyramid.UI.HorizontalLayout.prototype = new Pyramid.UI.AlignedLayout;

Pyramid.UI.VerticalLayout = function(gap, hAlign, vAlign) {
    if (this == Pyramid.UI) return;
    Pyramid.UI.AlignedLayout.call(this, gap, hAlign, vAlign);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.HorizontalLayout,
            processChildren: function(children, width, height, maxWidth, maxHeight, totalWidth, totalHeight) {
                if (width == 0) width = maxWidth;
                if (height == 0) height = totalHeight;
                var startY = 0;
                var gap = this.gap;
                totalHeight += (children.length - 1) * gap;
                switch (this.vAlign) {
                    case "center":
                        startY = (height - totalHeight) * .5;
                        break;
                    case "far":
                        startY = height - totalHeight;
                        break;
                }

                switch (this.hAlign) {
                    case "near":
                        children.forEach
                        (
                            function(child) {
                                if (!child.visible()) return;
                                child.y(startY);
                                startY += child.height() + gap;
                            }
                        );
                        break;
                    case "center":
                        children.forEach
                        (
                            function(child) {
                                if (!child.visible()) return;
                                var x = (width - child.width()) * .5;
                                child.move(x, startY);
                                startY += child.height() + gap;
                            }
                        );
                        break;
                    case "far":
                        children.forEach
                        (
                            function(child) {
                                if (!child.visible()) return;
                                var x = (width - child.width());
                                child.move(x, startY);
                                startY += child.height() + gap;
                            }
                        );
                        break;
                }
            }
        }
    );
};

var p = Pyramid.UI.VerticalLayout.prototype = new Pyramid.UI.AlignedLayout;


Pyramid.UI.Group = function() {
    if (this == Pyramid.UI) return;
    Pyramid.UI.ContainerControl.call(this, arguments);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.UI.Group,
            layout: null,
            layoutUpdate: function() {
                host.update();
            },
            processLayout: function() {
                var stage = this.$.stage();
                if (stage && this.layout) {
                    var lHost = $PM(this.layout);
                    var absBounds = this.getAbsoluteContentBounds();
                    lHost.process($PM(this.container).children, absBounds.width, absBounds.height);
                }
            },
            onCalculateBounds: function() {
                this.processLayout();
            }
        }
    );
};

var p = Pyramid.UI.Group.prototype = new Pyramid.UI.ContainerControl;

p.layout = function(v) {
    /// <returns type="Pyramid.UI.LayoutBase" />
    var host = $PM(this);
    if (Pyramid.UI.LayoutBase.POF(v)) {
        if (v != host.layout) {
            if (host.layout)
                host.layout.removeEventListener("update", host.layoutUpdate);
            host.layout = v;
            host.layout.addEventListener("update", host.layoutUpdate);
            host.update();
        }
    }
    return host.layout;
};

p.clearLayout = function() {
    /// <returns type="Pyramid.UI.LayoutBase" />
    var host = $PM(this);
    var p = host.layout;
    if (host.layout)
        host.layout.removeEventListener("update", host.layoutUpdate);
    host.layout = null;
    if (p) host.update();
    return p;
};