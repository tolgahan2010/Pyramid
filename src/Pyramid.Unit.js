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

Pyramid.Unit = function(type, value) {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.Unit,
            $properties: ["type", "value"],
            type: "pixel",
            value: 0,
            calculate: function(num) {
                switch (this.type) {
                    case "percent":
                        return num * (this.value / 100);
                }
                return this.value;
            }
        }
    );

    host._setv("type", type, Pyramid.Unit.UnitTypes, true);
    host._setnum("value", value, true);
};

Pyramid.Unit.UnitTypes =
{
    pixel: "pixel",
    percent: "percent"
};

var p = Pyramid.Unit.prototype = new Pyramid.EventDispatcher;

p.clone = function() {
    /// <returns type="Pyramid.Unit" />
    var host = $PM(this);
    return new Pyramid.Unit(host.type, host.value);
};

p.type = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("type", v, Pyramid.Unit.UnitTypes);
};

p.value = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setnum("value", v);
};