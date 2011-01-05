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

/// <reference path="Pyramid.Object.js" />
/// <reference path="Pyramid.Rectangle.js" />
/// <reference path="Pyramid.Shadow.js" />

Pyramid.GraphicsPath = function() {
    if (this == Pyramid) return;
    Pyramid.Object.call(this, arguments);
    function Int(v, c) {
        c = c || v.length;
        for (var i = 0; i < c; i++) v[i] = Math.floor(v[i]);
    }
    $PD
    (
        this,
        {
            $class: Pyramid.GraphicsPath,
            commands: [],
            lastCommand: null,
            lastX: 0,
            lastY: 0,
            shadow: new Pyramid.Shadow,
            moveTo: function(x, y) {
                Int(arguments);
                if (this.lastCommand == "moveTo") {
                    this.commands.last().params = [x, y];
                } else {
                    this.lastCommand = "moveTo";
                    this.commands.push({ name: "moveTo", params: [x, y] });
                }
                this.lastX = x;
                this.lastY = y;
            },
            lineTo: function(x, y) {
                Int(arguments);
                if (!this.lastCommand)
                    this.moveTo(0, 0);
                this.commands.push({ name: this.lastCommand = "lineTo", params: [x, y] });
                this.updateBounds(this.lastX, this.lastY, x, y);
                this.lastX = x;
                this.lastY = y;
            },
            quadraticCurveTo: function(cpx, cpy, x, y) {
                Int(arguments);
                if (!this.lastCommand) {
                    this.moveTo(0, 0);
                }
                this.commands.push({ name: this.lastCommand = "quadraticCurveTo", params: [cpx, cpy, x, y] });
                this.updateBounds(cpx, cpy, x, y);
                this.lastX = x;
                this.lastY = y;
            },
            bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
                if (!this.lastCommand) this.moveTo(0, 0);
                Int(arguments);
                this.commands.push({ name: this.lastCommand = "bezierCurveTo", params: [cp1x, cp1y, cp2x, cp2y, x, y] });

                var minx = cp1x, maxx = cp1x, miny = cp1y, maxy = cp1y;

                if (cp2x < minx) minx = cp2x;
                if (x < minx) minx = x;
                if (cp2y < miny) miny = cp2y;
                if (y < miny) miny = y;

                if (cp2x > maxx) maxx = cp2x;
                if (x > maxx) maxx = x;
                if (cp2y > maxy) maxy = cp2y;
                if (y > maxy) maxy = y;

                this.updateBounds(minx, miny, maxx, maxy);

                this.lastX = x;
                this.lastY = y;
            },
            arcTo: function(x1, y1, x2, y2, radius) {
                if (x1 == x2 && y1 == y2) return;
                Int(arguments);

                if (!this.lastCommand) this.moveTo(0, 0);
                this.commands.push({ name: this.lastCommand = "arcTo", params: [x1, y1, x2, y2, radius] });

                var x = this.lastX;
                var y = this.lastY;

                var r1 = Math.atan2(x / x1, y / y1);
                var r2 = Math.atan2(x1 / x2, y1 / y2);

                this.updateBounds(radius * Math.cos(r1), radius * Math.sin(r1), radius * Math.cos(r2), radius * Math.sin(r2));

                this.lastX = x2;
                this.lastY = y2;
            },
            arc: function(x, y, radius, startAngle, endAngle, antiClockwise) {
                if (radius < 1 || startAngle == endAngle) return;
                Int(arguments, 3);

                this.commands.push({ name: this.lastCommand = "arc", params: [x, y, radius, startAngle, endAngle, antiClockwise] });

                this.updateBounds(x - radius, y - radius, radius * 2, radius * 2);

                this.lastX = x;
                this.lastY = y;
            },
            rect: function(x, y, width, height) {
                if (width < 1 && height < 1) return;
                if (width < 1) {
                    this.moveTo(x, y);
                    this.lineTo(x, y + height);
                    return;
                }

                if (height < 1) {
                    this.moveTo(x, y);
                    this.lineTo(x + width, y);
                    return;
                }

                Int(arguments);
                this.commands.push({ name: this.lastCommand = "rect", params: [x, y, width, height] });

                this.updateBounds(x, y, x + width, y + height);

                this.lastX = x;
                this.lastY = y;
            },
            bounds: null,
            updateBounds: function(l, t, r, b) {
                var ll = l, tt = t, rr = r, bb = b;
                if (r < l) {
                    ll = r;
                    rr = l;
                }

                if (b < t) {
                    bb = t;
                    tt = b;
                }

                if (this.bounds) {
                    $PM(this.bounds).inflateToLTRB(ll, tt, rr, bb);
                } else {
                    this.bounds = Pyramid.Rectangle.FromLTRB(ll, tt, rr, bb);
                }
            },
            apply: function(canvas, context, canStroke, canFill, clip) {

                if (!clip) {
                    context.save();
                    $PM(this.shadow).apply(canvas, context);
                }

                context.beginPath();

                this.commands.forEach
                    (
                        function(item) {
                            context[item.name].apply(context, item.params);
                        },
                        this
                    );
                    
                if (!clip) {
                    if (canFill) context.fill();
                    if (canStroke) context.stroke();
                } else {
                    context.clip();
                }

                context.closePath();
                context.beginPath();
                
                if (!clip) {
                    $PM(this.shadow).reset(canvas, context);
                    context.restore();
                }
            },
            compile: function() {
                return {
                    bounds: (this.bounds ? this.bounds.toObject() : {x:0, y:0, width:0, height:0}),
                    apply: this.apply,
                    commands: this.commands,
                    shadow: this.shadow.clone(),
                    dispose: function() {
                        this.shadow.dispose();
                        delete this.apply;
                        delete this.bounds;
                        delete this.commands;
                        delete this.shadow;
                        delete this.dispose;
                    }
                }
            },
            canDraw: function() {
                return this.bounds != null;
            }

        }
    );
};

Pyramid.GraphicsPath.prototype = new Pyramid.Object;


var p = Pyramid.GraphicsPath.prototype;

p.reset = function() {
    var host = $PM(this);
    host.commands.length = 0;
    host.bounds = null;
    host.lastCommand = null;
    host.lastX = host.lastY = 0;
    host.shadow.enabled(false);
};
p.shadow = function() {
    /// <returns type="Pyramid.Shadow" />
    return $PM(this).shadow;
};
p.bounds = function() {
    var b = $PM(this).bounds;
    return b ? b.clone() : new Pyramid.Rectangle;
};

p.moveTo = function(x, y) {
    if (Pyramid.IsNUM(x, y)) {
        var host = $PM(this);
        host.moveTo(x, y);
    }
};

p.lineTo = function(x, y) {
    if (Pyramid.IsNUM(x, y)) {
        var host = $PM(this);
        host.lineTo(x, y);
    }
};

p.curveTo = function(x, y, ax, ay) {
    if (Pyramid.IsNUM(x, y, ax, ay)) {
        var host = $PM(this);
        host.quadraticCurveTo(ax, ay, x, y);
    }
};

p.bezierTo = function(x, y, cx1, cy1, cx2, cy2) {
    if (Pyramid.IsNUM(x, y, cx1, cy1, cx2, cy2)) {
        var host = $PM(this);
        host.bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
    }
};

p.arcTo = function(x1, y1, x2, y2, radius) {
    if (Pyramid.IsNUM(x1, y1, x2, y2, radius)) {
        var host = $PM(this);
        host.arcTo(x1, y1, x2, y2, radius);
    }
};

p.rect = function(x, y, width, height) {
    if (Pyramid.IsNUM(x, y, width, height)) {
        var host = $PM(this);
        host.rect(x, y, width, height);
    }
};

p.arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    if (Pyramid.IsNUM(x, y, radius, startAngle, endAngle)) {
        if (radius < 1) return;
        var host = $PM(this);
        host.moveTo(x, y);
        host.arc(x, y, radius, startAngle, endAngle, antiClockwise);
    }
};

p.roundRect = function(x, y, width, height, r) {
    if (Pyramid.IsNUM(x, y, width, height)) {
        if (!Pyramid.IsNUM(r) || r < 2) {
            this.rect(x, y, width, height);
        } else {
            if (width < 1 && height < 1)
                return;
            var host = $PM(this);
            if (width < 1) {
                host.moveTo(x, y);
                host.lineTo(x, y + height);
            } else if (height < 1) {
                host.moveTo(x, y);
                host.lineTo(x + width, y);
            } else {
                var min = width < height ? width : height;
                if (min < 4) {
                    host.rect(x, y, width, height);
                    return;
                }
                min *= .5;
                if (r > min) r = min;
                var hr = r * .5;
                host.moveTo(x + hr, y);
                host.lineTo(x + width - hr, y);
                host.quadraticCurveTo(x + width, y, x + width, y + hr);
                host.lineTo(x + width, y + height - hr);
                host.quadraticCurveTo(x + width, y + height, x + width - hr, y + height);
                host.lineTo(x + hr, y + height);
                host.quadraticCurveTo(x, y + height, x, y + height - hr);
                host.lineTo(x, y + hr);
                host.quadraticCurveTo(x, y, x + hr, y);
            }
        }
    }
};
p.roundRectComplex = function(x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
    var tl = topLeftRadius, tr = topRightRadius, bl = bottomLeftRadius, br = bottomRightRadius;
    if (tl == tr && bl == br && bl == tl) {
        this.roundRect(x, y, width, height, tl);
    } else {
        if (Pyramid.IsNUM(x, y, width, height)) {
            if (width < 1 && height < 1) return;
            var host = $PM(this);
            if (width < 1) {
                host.moveTo(x, y);
                host.lineTo(x, y + height);
            } else if (height < 1) {
                host.moveTo(x, y);
                host.lineTo(x + width, y);
            } else {
                if (!Pyramid.IsNUM(tl))
                    tl = 0;
                if (!Pyramid.IsNUM(tr))
                    tr = 0;
                if (!Pyramid.IsNUM(bl))
                    bl = 0;
                if (!Pyramid.IsNUM(br))
                    br = 0;

                if (tl == tr && bl == br && bl == tl || (tl < 2 && tr < 2 && bl < 2 && br < 2)) {
                    host.rect(x, y, width, height);
                } else {
                    var min = width < height ? width : height;
                    if (min < 4) {
                        host.rect(x, y, width, height);
                        return;
                    }

                    min *= .5;

                    if (tl > min) tl = min;
                    if (tr > min) tr = min;
                    if (bl > min) bl = min;
                    if (br > min) br = min;

                    var hr;
                    if (tl < 2) {
                        host.moveTo(x, y);
                    } else {
                        hr = tl * .5;
                        host.moveTo(x + hr, y);
                    }
                    if (tr < 2) {
                        host.lineTo(x + width, y);
                    } else {
                        hr = tr * .5;
                        host.lineTo(x + width - hr, y);
                        host.quadraticCurveTo(x + width, y, x + width, y + hr);
                    }
                    if (br < 2) {
                        host.lineTo(x + width, y + height);
                    } else {
                        hr = br * .5;
                        host.lineTo(x + width, y + height - hr);
                        host.quadraticCurveTo(x + width, y + height, x + width - hr, y + height);
                    }
                    if (bl < 2) {
                        host.lineTo(x, y + height);
                    } else {
                        hr = bl * .5;
                        host.lineTo(x + hr, y + height);
                        host.quadraticCurveTo(x, y + height, x, y + height - hr);
                    }
                    if (tl < 2) {
                        host.lineTo(x, y);
                    } else {
                        hr = tl * .5;
                        host.lineTo(x, y + hr);
                        host.quadraticCurveTo(x, y, x + hr, y);
                    }
                }
            }
        }
    }
};
p.ellipse = function(x, y, width, height) {
    if (Pyramid.IsNUM(x, y, width, height)) {
        if (width < 1 && height < 1) return;
        var host = $PM(this);
        if (width < 1) {
            host.moveTo(x, y);
            host.lineTo(x, y + height);
        } else if (height < 1) {
            host.moveTo(x, y);
            host.lineTo(x + width, y);
        } else {
            var hw = width * .5,
                hh = height * .5;
            host.moveTo(x + hw, y);
            host.bezierCurveTo(x + hw, y, x + width, y, x + width, y + hh);
            host.bezierCurveTo(x + width, y + hh, x + width, y + height, x + hw, y + height);
            host.bezierCurveTo(x + hw, y + height, x, y + height, x, y + hh);
            host.bezierCurveTo(x, y + hh, x, y, x + hw, y);
        }
    }
};

p.circle = function(x, y, radius) {
    if (Pyramid.IsNUM(x, y, radius)) {
        if (radius < 1) return;
        this.arc(x, y, radius, 0, Math.PI2, true);
    }
};

p.pie = function(x, y, radius, startAngle, endAngle) {
    if (Pyramid.IsNUM(x, y, radius, startAngle, endAngle)) {
        if (radius < 1) return;
        var host = $PM(this);
        var dif = startAngle - endAngle;
        if (dif < 0) dif = -dif;
        if (!dif) return;
        if (dif >= Math.PI2) {
            host.arc(x, y, radius, 0, Math.PI2, false);
        } else {
            host.arc(x, y, radius, startAngle, endAngle, false);
            host.lineTo(x, y);
        }
    }
};