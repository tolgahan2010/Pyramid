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
/// <reference path="Pyramid.GraphicsPath.js" />
/// <reference path="Pyramid.Pen.js" />
/// <reference path="Pyramid.Brush.js" />
/// <reference path="Pyramid.Shadow.js" />
/// <reference path="Pyramid.Font.js" />
/// <reference path="Pyramid.TextFormat.js" />

var p;
/** Graphics Begin **/

Pyramid.Graphics = function() {
    if (this == Pyramid) return;
    Pyramid.EventDispatcher.call(this, arguments);
    var thisHost;

    thisHost = $PD
    (
        this,
        {
            $class: Pyramid.Graphics,
            commands: [],
            bounds: null,
            hasCommandAfterPen: false,
            hasCommandAfterBrush: false,
            lastPen: null,
            lastBrush: null,
            lastRBB: null,
            lastRBP: null,
            shadow: new Pyramid.Shadow,
            allPens: [],
            allBrushes: [],
            maxBW: 0,
            rbpen: false,
            rbbrush: false,
            dispose: function(notUpdate) {
                if (!this.commands.length) return;
                if (this.bounds) this.bounds.dispose();
                this.bounds = null;
                this.hasCommandAfterBrush = false;
                this.hasCommandAfterPen = false;
                this.lastPen = null;
                this.lastBrush = null;
                this.maxBW = 0;
                this.rbbrush = false;
                this.rbpen = false;
                this.lastRBB = this.lastRBP = null;
                this.allBrushes.forEach
                (
                    function(item) {
                        item.brush.$.removeEventListener("update", this.penBrushUpdate);
                        item.brush = null;
                    },
                    this
                );
                this.allPens.forEach
                (
                    function(item) {
                        item.pen.$.removeEventListener("update", this.penBrushUpdate);
                        item.pen = null;
                    },
                    this
                );

                Pyramid.Object.Globals.Dispose(this.commands);

                delete this.commands;
                delete this.allBrushes;
                delete this.allPens;

                this.commands = [];
                this.allBrushes = [];
                this.allPens = [];
                if (!notUpdate)
                    this.update();
            },
            penBrushUpdate: function(event) {
                thisHost.update();
            },
            addPen: function(penObj) {
                var pen = penObj.pen.$;
                penObj.pen.$.addEventListener("update", this.penBrushUpdate);
                this.allPens.push(penObj);
                this.maxBW = 0;
                this.allPens.forEach
                    (
                        function(item) {
                            if (this.maxBW < item.pen.weight)
                                this.maxBW = item.pen.weight;
                        },
                        this
                    );
            },
            remPen: function(penObj, notCalc) {
                penObj.pen.$.removeEventListener("update", this.penBrushUpdate);
                this.allPens.remove(penObj);
                if (notCalc) return;
                this.maxBW = 0;
                this.allPens.forEach
                    (
                        function(item) {
                            if (this.maxBW < item.pen.weight)
                                this.maxBW = item.pen.weight;
                        },
                        this
                    );
            },
            addBrush: function(brushObj) {
                brushObj.brush.$.addEventListener("update", this.penBrushUpdate);
                this.allBrushes.push(brushObj);
            },
            remBrush: function(brushObj) {
                brushObj.brush.$.removeEventListener("update", this.penBrushUpdate);
                this.allBrushes.remove(brushObj);
            },
            updateBounds: function(src, type, a, b, c, d) {
                if (this.bounds) {
                    if (src) {
                        $PM(this.bounds).inflateToLTRB(src.left, src.top, src.right, src.bottom);
                    } else if (type == 0) {
                        $PM(this.bounds).inflateToLTRB(a, b, c, d);
                    } else if (type == 1) {
                        $PM(this.bounds).inflateToLTRB(a, b, c + a, d + b);
                    } else if (type == 2) {
                        var rt = $PM(a);
                        $PM(this.bounds).inflateToLTRB(rt.x, rt.y, rt.x + rt.width, rt.y + rt.height);
                    }
                } else {
                    if (src) {
                        this.bounds = src.clone();
                    } else if (type == 0) {
                        this.bounds = Pyramid.Rectangle.FromLTRB(a, b, c, d);
                    } else if (type == 1) {
                        this.bounds = new Pyramid.Rectangle(a, b, c, d);
                    } else if (type == 2) {
                        this.bounds = a.clone();
                    }
                }
            },
            resizePen: function(v) {
                if (v != this.rbpen) {
                    this.rbpen = v;

                    this.commands.push(this.lastRBP = { type: 3000, value: v });

                    this.update();
                }
            },
            resizeBrush: function(v) {
                if (v != this.rbbrush) {
                    this.rbbrush = v;

                    this.commands.push(this.lastRBB = { type: 3001, value: v });

                    this.update();
                }
            },
            selectPen: function(v) {
                if (this.lastPen) {
                    if (this.hasCommandAfterPen) {
                        this.commands.push(this.lastPen = { type: 1000, pen: $PM(v) });
                        this.hasCommandAfterPen = false;
                    } else {
                        this.remPen(this.lastPen, true);
                        this.lastPen.pen = $PM(v);
                    }
                } else {
                    this.commands.push(this.lastPen = { type: 1000, pen: $PM(v) });
                    this.hasCommandAfterPen = false;
                }
                this.addPen(this.lastPen);
            },
            deselectPen: function() {
                if (this.lastPen) {
                    if (this.hasCommandAfterPen) {
                        this.commands.push({ type: 2000 });
                        this.lastPen = null;
                    } else {
                        var index = this.commands.indexOf(this.lastPen);
                        this.commands.splice(index, 1);
                        this.remPen(this.lastPen);
                        this.lastPen = null;
                    }
                }
            },
            selectBrush: function(v) {
                if (this.lastBrush) {
                    if (this.hasCommandAfterBrush) {
                        this.commands.push(this.lastBrush = { type: 1001, brush: $PM(v) });
                        this.hasCommandAfterBrush = false;
                    } else {
                        this.remBrush(this.lastBrush);
                        this.lastBrush.brush = $PM(v);
                    }
                } else {
                    this.commands.push(this.lastBrush = { type: 1001, brush: $PM(v) });
                    this.hasCommandAfterBrush = false;
                }
                this.addBrush(this.lastBrush);
            },
            deselectBrush: function() {
                if (this.lastBrush) {
                    if (this.hasCommandAfterBrush) {
                        this.commands.push({ type: 2001 });
                        this.lastBrush = null;
                    } else {
                        var index = this.commands.indexOf(this.lastBrush);
                        this.commands.splice(index, 1);
                        this.remBrush(this.lastBrush);
                        this.lastBrush = null;
                    }
                }
            },
            addPath: function(path) {
                var host = $PM(path);
                if ((this.lastBrush || this.lastPen) && host.canDraw()) {
                    var c;
                    this.commands.push({ type: 0, path: c = host.compile(), rectObject: c.bounds.clone() });
                    this.updateBounds(c.bounds);
                    this.hasCommandAfterPen = true;
                    this.hasCommandAfterBrush = true;
                    this.update();
                }
            },
            drawRect: function(rectObj) {
                if (!this.lastBrush && !this.lastPen) return;
                var rect = rectObj.toObject();
                this.commands.push({ type: 1, rect: rect, rectObject: rectObj.clone() });
                this.updateBounds(rect);
                this.hasCommandAfterPen = true;
                this.hasCommandAfterBrush = true;
                this.update();
            },
            drawTextLine: function(text, x, y, font, format, maxWidth) {
                if (!maxWidth) maxWidth = 0;
                if (!this.lastPen && !this.lastBrush) return;

                if (!Pyramid.Font.POF(font))
                    font = new Pyramid.Font;
                else
                    font = font.clone();


                if (!Pyramid.TextFormat.POF(format))
                    format = new Pyramid.TextFormat;
                else {
                    format = format.clone();
                }

                var fhost = $PM(font);
                var fmthost = $PM(format);
                var w = maxWidth ? maxWidth : fhost.textWidth(text);
                var h = fhost.size;
                var xdif = 0;

                switch (fmthost.horizontalAlign) {
                    case "center":
                        xdif = w * .5;
                        break;
                    case "end":
                    case "far":
                        xdif = w;
                        break;
                }
                var rect = new Pyramid.Rectangle(x, y, w, h);
                this.commands.push({ type: 2, x: x + xdif, y: y, font: fhost, rect: rect, rectObject: rect.clone(), format: fmthost, maxWidth: maxWidth, text: text });
                this.updateBounds(null, 2, rect);
                this.hasCommandAfterPen = true;
                this.hasCommandAfterBrush = true;
                this.update();
            },
            drawText: function(text, font, format, bounds) {
                if (!this.lastPen && !this.lastBrush) return;
                if (text.indexOf("\n") < 0 && !bounds) {
                    this.drawTextLine(text, 0, 0, font, format);
                } else {
                    if (Pyramid.Font.POF(font))
                        font = font.clone();
                    else
                        font = new Pyramid.Font;

                    if (Pyramid.TextFormat.POF(format))
                        format = format.clone();
                    else
                        format = new Pyramid.TextFormat;

                    var fontHost = $PM(font);
                    var formatHost = $PM(format);
                    var lineHeight = $PM(formatHost.lineHeight);

                    var hasBounds = Pyramid.Rectangle.POF(bounds) && ((bhost = $PM(bounds)).width || bhost.height);
                    var maxLineWidth = (hasBounds && bhost.width) ? bhost.width : Number.MAX_VALUE;
                    var maxHeight = (hasBounds && bhost.height) ? bhost.height : Number.MAX_VALUE;
                    var startX = hasBounds ? bhost.x : 0;
                    var startY = hasBounds ? bhost.y : 0;
                    var textLineHeight = lineHeight.calculate(fontHost.size);
                    var tabLen = formatHost.tabLength;
                    var lh = lineHeight.calculate(fontHost.size * 1.75);

                    var map;

                    var xdif = 0;

                    if (maxLineWidth == Number.MAX_VALUE) {
                        if (formatHost.horizontalAlign != "justify") {
                            map = fontHost.mapNoWidth(text, tabLen, textLineHeight, maxHeight);

                            xdif = formatHost.hPosition(map.maxWidth);

                            map.lines.forEach
                            (
                                function(item) {
                                    if (item.text != "") {
                                        var rect = new Pyramid.Rectangle(0, 0, map.maxWidth, lh);
                                        this.commands.push({ type: 2, rectObject: rect.clone(), x: startX + xdif, y: startY + item.y, font: fontHost, rect: rect, format: formatHost, maxWidth: map.maxWidth, text: item.text });
                                    }
                                },
                                this
                            );
                            this.updateBounds(null, 1, startX, startY, map.maxWidth + formatHost.indent, map.height);
                        } else {
                            map = fontHost.mapWordsNoWidth(text, tabLen, textLineHeight, maxHeight);
                            map.lines.forEach
                            (
                                function(item) {
                                    if (item.words.length) {
                                        var rect = new Pyramid.Rectangle(0, 0, map.maxWidth, lh);
                                        if (item.width == map.maxWidth || item.words.length < 2) {
                                            this.commands.push({ type: 2, rectObject: rect.clone(), x: startX, y: startY + item.y, font: fontHost, rect: rect, format: formatHost, maxWidth: map.maxWidth, text: item.text });
                                        } else {
                                            var space = (map.maxWidth - item.textWidth) / (item.words.length - 1);
                                            var curPos = startX;
                                            var maxIndex = item.words.length - 2;
                                            item.words.some
                                            (
                                                function(word, index) {
                                                    var rect = new Pyramid.Rectangle(0, 0, word.width, lh);
                                                    this.commands.push({ type: 2, rectObject: rect.clone(), x: curPos, y: startY + item.y, font: fontHost, rect: rect, format: formatHost, maxWidth: 0, text: word.text });
                                                    curPos += word.width + space;
                                                    return index >= maxIndex;
                                                },
                                                this
                                            );
                                            var word = item.words[maxIndex + 1];
                                            var rect = new Pyramid.Rectangle(0, 0, word.width, lh);
                                            this.commands.push({ type: 2, rectObject: rect.clone(), x: map.maxWidth - word.width, y: startY + item.y, font: fontHost, rect: rect, format: formatHost, maxWidth: 0, text: word.text });
                                        }
                                    }
                                },
                                this
                            );
                            this.updateBounds(null, 1, startX, startY, map.maxWidth, map.height);
                        }
                    } else {
                        map = fontHost.mapWidth(text, maxLineWidth, formatHost.indent, tabLen, textLineHeight, maxHeight);

                        xdif = formatHost.hPosition(maxLineWidth);
                        var xdif2 = formatHost.hPosition(maxLineWidth, true);

                        map.lines.forEach
                        (
                            function(item) {
                                if (item.text != "") {
                                    var rect = new Pyramid.Rectangle(0, 0, map.maxWidth, lh);
                                    this.commands.push({ type: 2, rectObject: rect.clone(), x: startX + (item.indent ? xdif : xdif2), y: startY + item.y, font: fontHost, rect: rect, format: formatHost, maxWidth: map.maxWidth, text: item.text });
                                }
                            },
                            this
                        );
                        this.updateBounds(null, 1, startX, startY, map.maxWidth + formatHost.indent, map.height);
                    }
                }
                this.hasCommandAfterPen = true;
                this.hasCommandAfterBrush = true;
                this.update();
            },
            canDraw: function(xMin, yMin) {
                xMin = xMin || 0;
                yMin = yMin || 0;
                if (!this.bounds) return null;
                var bhost = $PM(this.bounds);
                var xpos = Math.ceil(bhost.x);
                var ypos = Math.ceil(bhost.y);
                var w = Math.ceil(bhost.width + this.maxBW);
                var h = Math.ceil(bhost.height + this.maxBW);
                var right = xpos + w;
                var bottom = ypos + h;
                if (right <= xMin || bottom <= yMin) return null;
                var maxw = xpos < 0 ? w - xpos : w + xpos;
                var maxh = ypos < 0 ? h - ypos : h + ypos;
                var minx = xpos < 0 ? xpos : 0;
                var miny = ypos < 0 ? ypos : 0;
                return { x: xpos, y: ypos, w: w, h: h, r: right, b: bottom, maxw: maxw, maxh: maxh, minx: minx, miny: miny };
            },
            topLeft: function() {
                if (this.bounds) {
                    var bhost = $PM(this.bounds);
                    return { x: bhost.x, y: bhost.y }
                }
                return { x: 0, y: 0 };
            },
            render: function(canvas, context) {
                if (!this.commands.length) return;

                var shadow = $PM(this.shadow);
                shadow.apply(canvas, context);


                var drawCommands = this.commands;


                var hasLineStyle = false;
                var hasFillStyle = false;
                var lp, lb;
                var rbp = false, rbb = false;

                context.save();

                drawCommands.forEach
                (
                    function(item) {
                        item.rendered = true;
                        if (item.type < 1000) {
                            context.save();
                            if (hasLineStyle && (rbp || lp.needsApply)) {
                                lp.apply(canvas, context, item.rectObject, rbp);
                            }
                            if (hasFillStyle && (rbb || lb.needsApply)) {
                                lb.apply(canvas, context, item.rectObject, rbb);
                            }
                        }
                        switch (item.type) {
                            case 0:
                                item.path.apply(canvas, context, hasLineStyle, hasFillStyle);
                                break;
                            case 1:
                                if (hasFillStyle)
                                    context.fillRect(item.rect.x, item.rect.y, item.rect.width, item.rect.height);
                                if (hasLineStyle) {
                                    context.strokeRect(item.rect.x, item.rect.y, item.rect.width, item.rect.height);
                                }
                                break;
                            case 2:
                                item.font.apply(canvas, context);
                                item.format.apply(canvas, context);
                                if (hasFillStyle)
                                    context.fillText(item.text, item.x, item.y + item.font.lineHeight(), item.maxWidth);
                                if (hasLineStyle)
                                    context.strokeText(item.text, item.x, item.y + item.font.lineHeight(), item.maxWidth);
                                break;
                            case 1000:
                                hasLineStyle = true;
                                lp = item.pen;
                                lp.apply(canvas, context, this.bounds);
                                break;
                            case 1001:
                                hasFillStyle = true;
                                lb = item.brush;
                                lb.apply(canvas, context, this.bounds);
                                break;
                            case 2000:
                                hasLineStyle = false;
                                context.strokeStyle = null;
                                break;
                            case 2001:
                                hasFillStyle = false;
                                context.fillStyle = null;
                                break;
                            case 3000:
                                rbp = item.value;
                                break;
                            case 3001:
                                rbb = item.value;
                                break;
                        }

                        if (item.type < 1000) {
                            context.restore();
                        }
                    },
                    this
                );

                context.restore();
            },
            $init: function() {
                this.shadow.addEventListener("update", function() { thisHost.update(); });
            }
        }
    );
};

Pyramid.Graphics.prototype = new Pyramid.EventDispatcher;

p = Pyramid.Graphics.prototype;

p.bounds = function() {
    /// <returns type="Pyramid.Rectangle" />
    var host = $PM(this);
    return host.bounds ? host.bounds.clone() : new Pyramid.Rectangle;
};

p.clear = function() {
    /// <returns type="Pyramid.Graphics" />
    $PM(this).dispose();
    return this;
};

p.shadow = function() {
    /// <returns type="Pyramid.Shadow" />
    return $PM(this).shadow;
};

p.resizePenForEachDraw = function(v) {
    /// <param name="v" type="Boolean" />
    $PM(this).resizePen(v ? true : false);
};

p.resizeBrushForEachDraw = function(v) {
    /// <param name="v" type="Boolean" />
    $PM(this).resizeBrush(v ? true : false);
};

p.selectPen = function(v) {
    /// <param name="v" type="Pyramid.Pen" />
    /// <returns type="Pyramid.Graphics" />
    var host = $PM(this);
    if (Pyramid.Pen.POF(v)) {
        host.selectPen(v);
    } else {
        host.deselectPen();
    }
    return this;
};

p.selectBrush = function(v) {
    /// <param name="v" type="Pyramid.Brush" />
    /// <returns type="Pyramid.Graphics" />
    var host = $PM(this);
    if (Pyramid.Brush.BrushBase.POF(v)) {
        host.selectBrush(v);
    } else {
        host.deselectBrush();
    }
    return this;
};

p.drawRect = function(rectangle) {
    /// <param name="rectangle" type="Pyramid.Rectangle" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.Rectangle.POF(rectangle) && !rectangle.isEmpty()) {
        var host = $PM(this);
        host.drawRect(rectangle);
    }
    return this;
};

p.drawRectangle = function(x, y, w, h) {
    /// <param name="x" type="Number" />
    /// <param name="y" type="Number" />
    /// <param name="w" type="Number" />
    /// <param name="h" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    var rect = new Pyramid.Rectangle(x, y, w, h);
    this.drawRect(rect);
    rect.dispose();
    return this;
};

p.drawPath = function(gPath) {
    /// <param name="gPath" type="Pyramid.GraphicsPath" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.GraphicsPath.POF(gPath)) {
        var host = $PM(this);
        host.addPath(gPath);
    }
    return this;
};

p.drawPie = function(x, y, radius, startAngle, endAngle) {
    /// <param name="x" type="Number" />
    /// <param name="y" type="Number" />
    /// <param name="width" type="Number" />
    /// <param name="height" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsNUM(x, y, radius, startAngle, endAngle)) {
        var p = new Pyramid.GraphicsPath;
        p.pie(x, y, radius, startAngle, endAngle);
        $PM(this).addPath(p);
        p.dispose();
    }
    return this;
};

p.drawLine = function(x0, y0, x1, y1) {
    /// <param name="x0" type="Number" />
    /// <param name="y0" type="Number" />
    /// <param name="x1" type="Number" />
    /// <param name="y1" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsNUM(x0, y0, x1, y1)) {
        var p = new Pyramid.GraphicsPath;
        var phost = $PM(p);
        phost.moveTo(x0, y0);
        phost.lineTo(x1, y1);
        $PM(this).addPath(p);
    }
    return this;
};

p.drawEllipse = function(x, y, width, height) {
    /// <param name="x" type="Number" />
    /// <param name="y" type="Number" />
    /// <param name="width" type="Number" />
    /// <param name="height" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsNUM(x, y) && Pyramid.IsPNUM(width, height)) {
        var p = new Pyramid.GraphicsPath;
        p.ellipse(x, y, width, height);
        $PM(this).addPath(p);
        p.dispose();
    }
    return this;
};

p.drawCircle = function(x, y, radius) {
    /// <param name="x" type="Number" />
    /// <param name="y" type="Number" />
    /// <param name="radius" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsNUM(x, y, radius) && radius >= 1) {
        var p = new Pyramid.GraphicsPath;
        p.circle(x, y, radius);
        $PM(this).addPath(p);
        p.dispose();
    }
    return this;
};

p.drawRoundRect = function(x, y, width, height, r) {
    /// <param name="x" type="Number" />
    /// <param name="y" type="Number" />
    /// <param name="width" type="Number" />
    /// <param name="height" type="Number" />
    /// <param name="r" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsNUM(x, y, r) && Pyramid.IsPNUM(width, height)) {
        var p = new Pyramid.GraphicsPath;
        p.roundRect(x, y, width, height, r);
        $PM(this).addPath(p);
        p.dispose();
    }
    return this;
};

p.drawRoundRectComplex = function(x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
    /// <param name="x" type="Number" />
    /// <param name="y" type="Number" />
    /// <param name="width" type="Number" />
    /// <param name="height" type="Number" />
    /// <param name="topLeftRadius" type="Number" />
    /// <param name="topRightRadius" type="Number" />
    /// <param name="bottomLeftRadius" type="Number" />
    /// <param name="bottomRightRadius" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsNUM(x, y) && Pyramid.IsPNUM(width, height) && Pyramid.IsZPNUM(topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius)) {
        var p = new Pyramid.GraphicsPath;
        p.roundRectComplex(x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius);
        $PM(this).addPath(p);
        p.dispose();
    }
    return this;
};

p.drawTextLine = function(text, x, y, font, format, maxWidth) {
    /// <param name="text" type="String" />
    /// <param name="x" type="Number" />
    /// <param name="y" type="Number" />
    /// <param name="font" type="Pyramid.Font" />
    /// <param name="format" type="Pyramid.TextFormat" />
    /// <param name="maxWidth" type="Number" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsFSTR(text)) {
        if (!Pyramid.IsNUM(x)) x = 0;
        if (!Pyramid.IsNUM(y)) y = 0;
        var host = $PM(this);
        host.drawTextLine(text, x, y, font, format, maxWidth);
    }
    return this;
};

p.drawText = function(text, font, format, bounds) {
    /// <param name="text" type="String" />
    /// <param name="font" type="Pyramid.Font" />
    /// <param name="format" type="Pyramid.TextFormat" />
    /// <param name="bounds" type="Pyramid.Rectangle" />
    /// <returns type="Pyramid.Graphics" />
    if (Pyramid.IsFSTR(text)) {
        var host = $PM(this);
        host.drawText(text, font, format, bounds);
    }
    return this;
};


/** Graphics End   **/