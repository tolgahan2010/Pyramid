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

/// <reference path="Pyramid.Rectangle.js" />
/// <reference path="Pyramid.TextFormat.js" />
/// <reference path="Pyramid.EventDispatcher.js" />
Pyramid.Font = function(name, size, sizeUnit, bold, italic) {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);

    if (!Pyramid.IsFSTR(name)) name = "Tahoma, Helvetica, Arial, sans-serif";
    if (!Pyramid.IsPNUM(size)) size = 12;
    bold = bold ? true : false;
    italic = italic ? true : false;
    if (!Pyramid.Font.SizeUnit.hasOwnProperty(sizeUnit))
        sizeUnit = "px";

    $PD
    (
        this,
        {
            $class: Pyramid.Font,
            $properties: ["name", "size", "bold", "italic", "sizeUnit"],
            name: name,
            size: size,
            bold: bold,
            italic: italic,
            sizeUnit: sizeUnit,
            apply: function(canvas, context) {
                context.font =
                [
                    this.italic ? "italic" : "normal",
                    this.bold ? "bold" : "normal",
                    this.size + Pyramid.Font.SizeUnit[this.sizeUnit],
                    this.name
                ].join(" ");
            },
            lineHeight: function() {
                return this.size;
            },
            textWidth: function(text) {
                if (!Pyramid.IsFSTR(text))
                    return 0;
                var c = Pyramid.Object.Globals.Canvas;
                var ctx = c.getContext("2d");
                this.apply(c, ctx);
                return ctx.measureText(text).width;
            },
            mapWordsNoWidth: function(text, tabLen, lineHeight, maxH, data) {
                var c = Pyramid.Object.Globals.Canvas;
                var ctx = c.getContext("2d");
                this.apply(c, ctx);

                var cm = {};
                function gw(c) {
                    var w = cm[c];
                    if (!w) {
                        w = cm[c] = ctx.measureText(c).width;
                    }
                    return w;
                }
                text = text.replace(/\r?\n|\r/g, "\n");
                text = text.replace(/^[ \t]+|[ \t]+$/, "");
                var reg = /[ \t]{2}/g;
                while (text.match(reg)) text = text.replace(reg, " ");

                if (text == "" || maxH < lineHeight) return { maxWidth: 0, lines: [], data: data };

                var lines = text.split(/\n/g);

                var all = [];

                var y = 0;

                var maxW = 0;

                var spw = gw(" ");

                lines.some
                (
                    function(item) {
                        item = item.replace(/^[ \t]+|[ \t]+$/, "");
                        if (item != "") {
                            var words = item.split(/\s/g);

                            var line = { words: [], y: y, text: item };
                            var space = (words.length - 1) * spw;
                            var lineWidth = space;

                            words.forEach
                            (
                                function(word) {
                                    var width = gw(word);
                                    lineWidth += width;
                                    line.words.push({ text: word, width: width });
                                }
                            );

                            line.width = lineWidth;
                            line.textWidth = lineWidth - space;

                            all.push(line);

                            if (lineWidth > maxW) maxW = lineWidth;

                        } else {
                            all.push({ words: [], width: 0, y: y, width: 0 });
                        }
                        y += lineHeight;

                        return (y + lineHeight) > maxH;
                    }
                );

                return { maxWidth: maxW, height: y, lines: all, spaceWidth: spw, data: data };
            },
            mapNoWidth: function(text, tabLen, lineHeight, maxH, data) {
                var c = Pyramid.Object.Globals.Canvas;
                var ctx = c.getContext("2d");
                this.apply(c, ctx);

                var cm = {};
                function gw(c) {
                    var w = cm[c];
                    if (!w) {
                        w = cm[c] = ctx.measureText(c).width;
                    }
                    return w;
                }
                text = text.replace(/\r?\n|\r/g, "\n");
                var beforeTabs = text.split(/\t/g);
                var curIndex = 0;
                var tabSpace = String.create(" ", tabLen);
                var tabData = [];
                for (var i = 0; i < tabLen; i++)
                    tabData.push(String.create(" ", i));

                beforeTabs.forEach
                (
                    function(item, index, ary) {
                        if (item != "") {
                            curIndex += item.length;
                            var calcLen = tabLen - curIndex % tabLen;
                            ary[index] = item + tabData[calcLen];
                        } else {
                            curIndex += tabLen;
                            ary[index] = tabSpace;
                        }
                    }
                );

                text = beforeTabs.join("");

                if (maxH < lineHeight) return { maxWidth: 0, lines: [], data: data };

                var lines = text.split(/\n/g);

                var all = [];

                var y = 0;

                var maxW = 0;

                lines.some
                (
                    function(item) {
                        var width = gw(item);

                        all.push({ text: item, width: width, y: y });

                        if (width > maxW) maxW = width;

                        y += lineHeight;

                        return (y + lineHeight) > maxH;
                    }
                );

                return { maxWidth: maxW, height: y, lines: all, data: data };
            },
            mapWidth: function(text, maxW, indent, tabLen, lineHeight, maxH, data) {
                var c = Pyramid.Object.Globals.Canvas;
                var ctx = c.getContext("2d");
                this.apply(c, ctx);

                var cm = {};
                function gw(c) {
                    var w = cm[c];
                    if (!w) {
                        w = cm[c] = ctx.measureText(c).width;
                    }
                    return w;
                }
                text = text.replace(/\r?\n|\r/g, "\n");
                var curIndex = 0;
                var tabSpace = String.create(" ", tabLen);
                var tabData = [];
                for (var i = 0; i < tabLen; i++)
                    tabData.push(String.create(" ", i));

                if (tabLen) {
                    var beforeTabs = text.split(/\t/g);
                    if (beforeTabs.length > 1) {
                        beforeTabs.forEach
                        (
                            function(item, index, ary) {
                                if (item != "") {
                                    curIndex += item.length;
                                    var calcLen = tabLen - curIndex % tabLen;
                                    ary[index] = item + tabData[calcLen];
                                } else {
                                    curIndex += tabLen;
                                    ary[index] = tabSpace;
                                }
                            }
                        );
                            text = beforeTabs.join("");
                    }
                }


                if (maxH < lineHeight) return { maxWidth: 0, lines: [], data: data };

                var lines = text.split(/\n/g);

                var all = [];

                var y = 0;

                var spw = gw(" ");

                lines.some
                (
                    function(item) {
                        var width = gw(item);

                        if (width + indent > maxW) {

                            var w = maxW - indent;
                            var cur = 0;
                            var lastSpace = -1;
                            var index = 0;
                            var maxi = item.length;
                            var lastChar;
                            do {
                                lastChar = item.charAt(index);
                                if (lastChar == " ") lastSpace = index;
                                cur += gw(lastChar);
                                index++;
                            } while (cur < w && index < maxi);

                            var c = item.charAt(index);
                            if (lastSpace < 0 || c == " ") {
                                all.push({ text: item.substr(0, index), y: y, indent: true });
                                if (c == " ") index++;
                            } else {
                                all.push({ text: item.substr(0, lastSpace), y: y, indent: true });
                                index = lastSpace;
                            }

                            while ((y + lineHeight) <= maxH && index < maxi) {
                                y += lineHeight;
                                cur = 0;
                                lastSpace = -1;
                                w = maxW;
                                var startIndex = index;
                                do {
                                    lastChar = item.charAt(index);
                                    if (lastChar == " ") lastSpace = index;
                                    cur += gw(lastChar);
                                    index++;
                                } while (cur < w && index < maxi);
                                var text;
                                if (lastSpace < 0 || c == " " || index == maxi) {
                                    text = item.substring(startIndex, index);
                                    if (c == " ") index++;
                                } else {
                                    text = item.substring(startIndex, lastSpace);
                                    index = lastSpace + 1;
                                }
                                if (text.trim() != "") {
                                    all.push({ text: text, indent: false, y: y });
                                } else {
                                    y -= lineHeight;
                                }
                            }

                        } else {
                            all.push({ text: item, y: y, indent: true });
                        }


                        y += lineHeight;

                        return (y + lineHeight) > maxH;
                    }
                );

                return { maxWidth: maxW, height: y, lines: all, data: data };
            }
        }
    );
};

Pyramid.Font.Reset = function(canvas, context) {
    context.font = "normal normal 1em sans-serif";
};

Pyramid.Font.SizeUnit =
{
    px:"px"
};

var p = Pyramid.Font.prototype = new Pyramid.EventDispatcher;

p.clone = function() {
    /// <returns type="Pyramid.Font" />
    var host = $PM(this);
    return new Pyramid.Font(host.name, host.size, host.sizeUnit, host.bold, host.italic);
};

p.name = function(v) {
    /// <returns type="String" />
    return $PM(this)._setstri("name", v);
};

p.size = function(v) {
    /// <returns type="Number" />
    return $PM(this)._setpnum("size", v);
};

p.sizeUnit = function(v) {
    /// <returns type="String" />
    return $PM(this)._setv("sizeUnit", v, Pyramid.Font.SizeUnit);
};

p.bold = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("bold", v);
};

p.italic = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("italic", v);
};

p.getTextWidth = function(text) {
    /// <returns type="Number" />
    return $PM(this).textWidth(text);
};

p.setParams = function(name, size, bold, italic) {
    this.lockUpdate();
    this.name(name);
    this.size(size);
    this.bold(bold);
    this.italic(italic);
    this.unlockUpdate();
};