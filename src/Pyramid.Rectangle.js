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

/// <reference path="Pyramid.Point.js" />
var p;

Pyramid.Rectangle = function(x, y, width, height) {
    if (this == Pyramid) return;
    Pyramid.Point.call(this, x, y);
    $PD
    (
        this,
        {
            $class: Pyramid.Rectangle,
            $properties: ["width", "height"],
            width: 0,
            height: 0,
            inflateToLTRB: function(l, t, r, b) {
                if (l < this.x) {
                    this.width += this.x - l;
                    this.x = l;
                }
                if (t < this.y) {
                    this.height += this.y - t;
                    this.y = t;
                }
                if (r > this.width + this.x)
                    this.width = r - this.x;
                if (b > this.height + this.y)
                    this.height = b - this.y;
            }
        }
    );
    this.size(width, height);
};

Pyramid.Rectangle.FromLTRB = function(l, t, r, b) {
    return new Pyramid.Rectangle(l, t, r - l, b - t);
};

Pyramid.Rectangle.prototype = new Pyramid.Point(0, 0);

p = Pyramid.Rectangle.prototype;

p.clone = function() {
    /// <returns type="Pyramid.Rectangle" />
    var host = $PM(this);
    return new Pyramid.Rectangle(host.x, host.y, host.width, host.height);
};

p.width = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setzpnum("width", v);
};
p.height = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setzpnum("height", v);
};
p.inflate = function(x, y) {
    /// <returns type="Pyramid.Rectangle" />
    return $PM(this)._incs("x", -x, "width", x, "y", -y, "height", y);
};
p.size = function(width, height) {
    /// <returns type="Pyramid.Rectangle" />
    return $PM(this)._setzpnums("width", width, "height", height);
};
p.right = function() {
    /// <returns type="Number" />
    var host = $PM(this);
    return host.x + host.width;
};
p.bottom = function() {
    /// <returns type="Number" />
    var host = $PM(this);
    return host.y + host.height;
};
p.topLeft = function() {
    /// <returns type="Pyramid.Point" />
    return Pyramid.Point.prototype.clone.call(this);
};
p.bottomRight = function() {
    /// <returns type="Pyramid.Point" />
    return new Pyramid.Point(this.right(), this.bottom());
};
p.isEmpty = function() {
    /// <returns type="Boolean" />
    var host = $PM(this);
    return (host.width <= 1) || (host.height <= 1);
};
p.containsPoint = function(pt) {
    /// <returns type="Boolean" />
    var host = $PM(this);
    if (Pyramid.Point.POF(pt)) {
        return host.x <= pt._x && host.y <= pt._y && this.right() > pt._x && this.bottom() > pt._y;
    }
    return false;
};
p.floor = function() {
    var host = $PM(this);
    host.x = Math.floor(host.x);
    host.y = Math.floor(host.y);
    host.width = Math.floor(host.width);
    host.height = Math.floor(host.height);
};

p.toObject = function() {
    /// <returns type="Object" />
    var x = this.x(),
        y = this.y(),
        w = this.width(),
        h = this.height();
    return {
        x: x,
        y: y,
        width: w,
        height: h,
        left: x,
        top: y,
        right: x + w,
        bottom: y + h,
        clone: function() { return new Pyramid.Rectangle(this.x, this.y, this.width, this.height); }
    };
};
