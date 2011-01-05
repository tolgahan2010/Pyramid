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

Pyramid.Matrix2D = function(aOrMatrix2D, b, c, d, e, f) {
    if (this == Pyramid) return;

    var data = [1, 0, 0, 1, 0, 0];

    if (Pyramid.Matrix2D.POF(aOrMatrix2D)) {
        data = aOrMatrix2D.data();
    } else {
        if (Pyramid.IsNUM(aOrMatrix2D, b, c, d, e, f)) {
            data = [aOrMatrix2D, b, c, d, e, f];
        }
    }

    Pyramid.EventDispatcher.call(this, arguments);

    $PD
    (
        this,
        {
            $class: Pyramid.Matrix2D,
            $properties: ["data"],
            modified: false,
            data: data,
            isEmpty: function() {
                var d = this.data;
                return d[0] == 1 && d[1] == 0 && d[2] == 0 && d[3] == 1 && d[4] == 0 && d[5] == 0;
            },
            identity: function() {
                if (this.modified) {
                    this.data = [1, 0, 0, 1, 0, 0];
                    this.modified = false;
                    this.update();
                }
            },
            appendDirect: function(a, b, c, d, e, f) {
                var n = this.data;
                var na = n[0];
                var nb = n[1];
                var nc = n[2];
                var nd = n[3];
                var nx = n[4];
                var ny = n[5];
                n[0] = a * na + c * nb;
                n[1] = b * na + d * nb;
                n[2] = a * nc + c * nd;
                n[3] = b * nc + d * nd;
                n[4] = a * nx + c * ny + e;
                n[5] = b * nx + d * ny + f;
                this.modified = true;
                this.update();
            },
            append: function(a, b, c, d, e, f) {
                if (a != 1 || b != 0 || c != 0 || d != 1 || e != 0 || f != 0) {
                    this.appendDirect(a, b, c, d, e, f);
                }
            },
            prependDirect: function(a, b, c, d, e, f) {
                var old = this.data;
                this.data = [a, b, c, d, e, f];
                this.appendDirect(old[0], old[1], old[2], old[3], old[4], old[5]);
            },
            prepend: function(a, b, c, d, e, f) {
                if (!this.modified) {
                    this.data = [a, b, c, d, e, f];
                    this.modified = !this.isEmpty();
                    if (this.modified) this.update();
                    return;
                }
                if (a != 1 || b != 0 || c != 0 || d != 1 || e != 0 || f != 0) {
                    this.prependDirect(a, b, d, d, e, f);
                }
            },
            appendRotate: function(r) {
                if (r) {
                    var cos = Math.cos(r);
                    var sin = Math.sin(r);
                    this.appendDirect(cos, sin, -sin, cos, 0, 0);
                }
            },
            prependRotate: function(r) {
                if (r) {
                    var cos = Math.cos(r);
                    var sin = Math.sin(r);
                    this.prependDirect(cos, sin, -sin, cos, 0, 0);
                }
            },
            appendRotateOn: function(r, x, y) {
                if (r) {
                    var cos = Math.cos(r);
                    var sin = Math.sin(r);
                    if (x || y)
                        this.appendDirect(cos, sin, -sin, cos, -cos * x + sin * y + x, -sin * x - cos * y + y);
                    else
                        this.appendDirect(cos, sin, -sin, cos, 0, 0);
                }
            },
            prependRotateOn: function(r, x, y) {
                if (r) {
                    var cos = Math.cos(r);
                    var sin = Math.sin(r);
                    if (x || y)
                        this.prependDirect(cos, sin, -sin, cos, -cos * x + sin * y + x, -sin * x - cos * y + y);
                    else
                        this.prependDirect(cos, sin, -sin, cos, 0, 0);
                }
            },
            appendScale: function(x, y) {
                if (x || y) {
                    this.appendDirect(x, 0, 0, y, 0, 0);
                }
            },
            prependScale: function(x, y) {
                if (x || y) {
                    this.prependDirect(x, 0, 0, y, 0, 0);
                }
            },
            appendTranslate: function(x, y) {
                if (x || y) {
                    this.appendDirect(1, 0, 0, 1, x, y);
                }
            },
            prependTranslate: function(x, y) {
                if (x || y) {
                    this.prependDirect(1, 0, 0, 1, x, y);
                }
            },
            appendSkew: function(x, y) {
                if (x || y) {
                    this.appendDirect(1, -Math.tan(x), -Math.tan(y), 1, 0, 0);
                }
            },
            prependSkew: function(x, y) {
                if (x || y) {
                    this.prependDirect(1, -Math.tan(x), Math.tan(y), 1, 0, 0);
                }
            },
            appendReflect: function(a, b) {
                var a2 = a * a,
                b2 = b * b,
                n2 = a2 + b2,
                xy = 2 * a * b / n2;
                this.appendDirect(2 * a2 / n2 - 1, xy, xy, 2 * b2 / n2 - 1, 0, 0);
            },
            prependReflect: function(a, b) {
                var a2 = a * a,
                b2 = b * b,
                n2 = a2 + b2,
                xy = 2 * a * b / n2;
                this.prependDirect(2 * a2 / n2 - 1, xy, xy, 2 * b2 / n2 - 1, 0, 0);
            },
            invert: function() {
                var data = this.data;
                var m11 = data[0];
                var m12 = data[1];
                var m21 = data[2];
                var m22 = data[3];
                var dx = data[4];
                var dy = data[5];

                var d = m11 * m22 - m12 * m21;
                var dm = -d;
                this.data =
                [
                    m22 / d,
                    m12 / dm,
                    m21 / dm,
                    m11 / d,
                    (m21 * dy - m11 * dx) / d,
                    (m12 * dx - m22 * dy) / d
                ];
                this.modified = true;
                this.update();
            },
            apply2D: function(ctx, noTranslate) {
                var d = this.data;
                if (noTranslate) {
                    d = d.slice();
                    d[4] = d[5] = 0;
                }
                ctx.transform.apply(ctx, d);
            }
        }
    );
};

var p = Pyramid.Matrix2D.prototype = new Pyramid.EventDispatcher;
p.data = function() {
    /// <returns type="Array" />
    return $PM(this).data.slice();
};
p.m11 = function() {
    /// <returns type="Number" />
    return $PM(this).data[0];
};
p.m12 = function() {
    /// <returns type="Number" />
    return $PM(this).data[1];
};
p.m21 = function() {
    /// <returns type="Number" />
    return $PM(this).data[2];
};
p.m22 = function() {
    /// <returns type="Number" />
    return $PM(this).data[3];
};
p.dx = function() {
    /// <returns type="Number" />
    return $PM(this).data[4];
};
p.dy = function() {
    /// <returns type="Number" />
    return $PM(this).data[5];
};

p.isEmpty = function() {
    /// <returns type="Boolean" />
    return $PM(this).isEmpty();
};
p.rotate = function(r) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.IsANUM(r))
        $PM(this).appendRotate(r);
    return this;
};
p.prependRotate = function(r) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.IsANUM(r))
        $PM(this).prependRotate(r);
    return this;
};
p.rotateOn = function(r, x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.IsANUM(r)) {
        if (!Pyramid.IsNUM(x)) x = 0;
        if (!Pyramid.IsNUM(y)) y = 0;
        $PM(this).appendRotateOn(r, x, y);
    }
    return this;
};
p.prependRotateOn = function(r, x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.IsANUM(r)) {
        if (!Pyramid.IsNUM(x)) x = 0;
        if (!Pyramid.IsNUM(y)) y = 0;
        $PM(this).prependRotateOn(r, x, y);
    }
    return this;
};
p.translate = function(x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).appendTranslate(x, y);
    return this;
};
p.prependTranslate = function(x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).prependTranslate(x, y);
    return this;
};
p.scale = function(x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).appendScale(x, y);
    return this;
};
p.prependScale = function(x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).prependScale(x, y);
    return this;
};
p.skew = function(x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).appendSkew(x, y);
    return this;
};
p.prependSkew = function(x, y) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).prependSkew(x, y);
    return this;
};
p.reflect = function(y, x) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).appendReflect(x, y);
    return this;
};
p.prependReflect = function(y, x) {
    /// <returns type="Pyramid.Matrix2D" />
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PM(this).prependReflect(x, y);
    return this;
};
p.append = function(m11, m12, m21, m22, dx, dy) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.IsNUM(m11, m12, m21, m22, dx, dy)) {
        var host = $PM(this);
        host.append.call(host, m11, m12, m21, m22, dx, dy);
    }
    return this;
};
p.prepend = function(m11, m12, m21, m22, dx, dy) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.IsNUM(m11, m12, m21, m22, dx, dy)) {
        var host = $PM(this);
        host.prepend.call(host, m11, m12, m21, m22, dx, dy);
    }
    return this;
};
p.appendMatrix = function(m) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.Matrix2D.POF(m)) {
        var host = $PM(this);
        host.append.apply(host, $PM(m).data);
    }
    return this;
};
p.prependMatrix = function(m) {
    /// <returns type="Pyramid.Matrix2D" />
    if (Pyramid.Matrix2D.POF(m)) {
        var host = $PM(this);
        host.prepend.apply(host, $PM(m).data);
    }
    return this;
};

p.identity = function() {
    /// <returns type="Pyramid.Matrix2D" />
    $PM(this).identity();
    return this;
};

p.invert = function() {
    $PM(this).invert();
};

p.clone = function() {
    /// <returns type="Pyramid.Matrix2D" />
    return new Pyramid.Matrix2D(this);
};

p.applyToXY = function(x, y) {
    /// <returns type="Pyramid.Point" />
    var host = $PM(this);
    if (!host.isEmpty()) {
        var d = host.data;
        var xx = x, yy = y;
        x = d[0] * xx + d[2] * yy;
        y = d[1] * xx + d[3] * yy;
        x += d[4];
        y += d[5];
    }
    return new Pyramid.Point(x, y);
};

p.applyToPoint = function(pt) {
    /// <returns type="Pyramid.Point" />
    if (Pyramid.Point.POF(pt)) {
        var pthost = $PM(pt);
        var point = this.applyToXY(pthost.x, pthost.y);
        var phost = $PM(point);
        pthost.x = phost.x;
        pthost.y = phost.y;
        point.dispose();
    }
    return pt;
};

p.applyToPoints = function(ptArray) {
    /// <returns type="Array" />
    var x = 0, y = 0;
    var ary = [];
    host = $PM(this);
    if (!host.isEmpty()) {
        var d = host.data;
        if (ptArray instanceof Array) {
            for (var i = 0; i < ptArray.length; i++) {
                var pt = ptArray[i];
                if (Pyramid.Point.POF(pt)) {
                    x = pt.x();
                    y = pt.y();
                    var xx = x, yy = y;
                    x = d[0] * xx + d[2] * yy;
                    y = d[1] * xx + d[3] * yy;
                    x += d[4];
                    y += d[5];
                    ary.push(new Pyramid.Point(x, y));
                }
            }
        }
    } else {
        ary = ptArray || [];
    }
    return ary;
};


p.applyToXYWH = function(x, y, w, h) {
    /// <returns type="Pyramid.Rectangle" />
    var host = $PM(this);
    if (!host.isEmpty()) {
        var d = host.data;

        function xy(x, y) {
            var xx = x, yy = y;
            x = d[0] * xx + d[2] * yy;
            y = d[1] * xx + d[3] * yy;
            return { x: x, y: y };
        }


        function minmax(ary) {
            var minx = Number.MAX_VALUE;
            var maxx = Number.MIN_VALUE;
            var miny = Number.MAX_VALUE;
            var maxy = Number.MIN_VALUE;
            var minxy = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
            var maxxy = { x: Number.MIN_VALUE, y: Number.MIN_VALUE };
            var _maxxy = Number.MAX_VALUE;
            var _minxy = Number.MIN_VALUE;
            ary.forEach
            (
                function(item) {
                    if (item.x < minx) minx = item.x;
                    if (item.y < miny) miny = item.y;
                    if (item.x > maxx) maxx = item.x;
                    if (item.y > maxy) maxy = item.y;
                }
            );

            return { x: minx + d[4], y: miny + d[5], w: maxx - minx, h: maxy - miny };
        }
        var bounds = minmax
        (
            [
                xy(x, y),
                xy(x + w, y),
                xy(x + w, y + h),
                xy(x, y + h)
            ]
        );

        x = bounds.x;
        y = bounds.y;
        w = bounds.w;
        h = bounds.h;
    }
    return new Pyramid.Rectangle(x, y, w, h);
};

p.applyToRectangle = function(rt) {
    /// <returns type="Pyramid.Rectangle" />
    if (Pyramid.Rectangle.POF(rt)) {
        var rtHost = $PM(rt);
        var result = this.applyToXYWH(rtHost.x, rtHost.y, rtHost.width, rtHost.height);
        var resultHost = $PM(result);
        rtHost.x = resultHost.x;
        rtHost.y = resultHost.y;
        rtHost.width = resultHost.width;
        rtHost.height = resultHost.height;
        result.dispose();
        return rt;
    }
    return new Pyramid.Rectangle(0, 0, 0, 0);
};