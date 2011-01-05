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
var p;

Pyramid.Point = function(x, y) {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);
    if (!Pyramid.IsNUM(x)) x = 0;
    if (!Pyramid.IsNUM(y)) y = 0;
    $PD
    (
        this,
        {
            $class: Pyramid.Point,
            $properties: ["x", "y"],
            x: x,
            y: y
        }
    );
};

Pyramid.Point.prototype = new Pyramid.EventDispatcher;

p = Pyramid.Point.prototype;
p.x = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("x", v);
};
p.y = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("y", v);
};
p.offset = function(x, y) {
    /// <returns type="Pyramid.Point" />
    return $PM(this)._incs("x", x, "y", y);
};
p.offsetPoint = function(pt) {
    /// <returns type="Pyramid.Point" />
    var x = 0, y = 0;
    if (Pyramid.Point.POF(pt)) {
        var ptHost = $PM(pt);
        x = ptHost.x;
        y = ptHost.y;
    }
    return this.offset(x, y);
};

p.position = function(x, y) {
    /// <returns type="Pyramid.Point" />
    return $PM(this)._setnums("x", x, "y", y);
};
p.toPointObject = function() {
    /// <returns type="Object" />
    var host = $PM(this);
    var obj = { x: host.x, y: host.y };
    return obj;
};

p.revertPosition = function() {
    /// <returns type="Pyramid.Point" />
    var host = $PM(this);
    host.x = -host.x;
    host.y = -host.y;
    return this;
};

p.clone = function() {
    /// <returns type="Pyramid.Point" />
    var host = $PM(this);
    return new Pyramid.Point(host.x, host.y);
};