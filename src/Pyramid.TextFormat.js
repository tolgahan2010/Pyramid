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

/// <reference path="Pyramid.Unit.js" />

Pyramid.TextFormat = function(baseline, hAlign, vAlign, tabLength, indent, lineHeight) {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);

    var host = $PD
    (
        this,
        {
            $class: Pyramid.TextFormat,
            $properties: ["align", "baseLine"],
            horizontalAlign: "justify",
            baseline: "bottom",
            lineHeight: null,
            verticalAlign: "center",
            tabLength: 8,
            indent: 15,
            hAlign: function(a, b) {
                switch (a) {
                    case "justify":
                        if (b) return a;
                        return "left";
                    case "near":
                        return "left";
                    case "far":
                        return "right";
                }
                return a;
            },
            vAlign: function(a) {
                switch (a) {
                    case "start":
                    case "near":
                    case "justify":
                        return "top";
                    case "end":
                    case "far":
                        return "bottom";
                }
                return "middle";
            },
            apply: function(canvas, context) {
                context.textAlign = this.hAlign(this.horizontalAlign);
                context.textBaseline = this.baseline;
            },
            hPosition: function(maxWidth, notUseIndent) {
                var indent = notUseIndent ? 0 : this.indent;
                switch (this.horizontalAlign) {
                    case "end":
                    case "far":
                        return maxWidth - indent;
                    case "center":
                        return maxWidth * .5;
                }
                return indent;
            }
        }
    );

    host._setv("baseline", baseline, Pyramid.TextFormat.Baseline, true);
    host._setv("horizontalAlign", hAlign, Pyramid.TextFormat.Align, true);
    host._setv("verticalAlign", vAlign, Pyramid.TextFormat.Align, true);
    host._setzpnum("indent", indent, true);
    host._setzpnum("tabLength", tabLength, true);

    if (Pyramid.Unit.POF(lineHeight))
        host.lineHeight = lineHeight.clone();
    else
        host.lineHeight = new Pyramid.Unit("percent", 120);

    host.lineHeight.addEventListener("update", function() { host.update(); });
};

Pyramid.TextFormat.Reset = function(canvas, context) {
    context.textAlign = "start";
    context.textBaseLine = "alphabetical";
};

Pyramid.TextFormat.Align =
{
    start: "start",
    end: "end",
    near: "near",
    far: "far",
    center: "center",
    justify: "justify"
};


Pyramid.TextFormat.Baseline =
{
    top: "top",
    hanging: "hanging",
    alphabetic: "alphabetic",
    ideographic : "ideographic",
    middle: "middle",
    bottom: "bottom"
};

var p = Pyramid.TextFormat.prototype = new Pyramid.EventDispatcher;

p.clone = function() {
    /// <returns type="Pyramid.TextFormat" />
    var host = $PM(this);
    return new Pyramid.TextFormat(host.baseline, host.horizontalAlign, host.verticalAlign, host.tabLength, host.indent, host.lineHeight);
};

p.lineHeight = function() {
    /// <returns type="Pyramid.Unit" />
    return $PM(this).lineHeight;
};

p.tabLength = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setzpnum("tabLength", v);
};

p.indent = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setzpnum("indent", v);
};

p.hAlign = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("horizontalAlign", v, Pyramid.TextFormat.Align);
};

p.vAlign = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("verticalAlign", v, Pyramid.TextFormat.Align);
};

p.baseline = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("baseline", v, Pyramid.TextFormat.Baseline);
};

