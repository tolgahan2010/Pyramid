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

/// <reference path="Pyramid.DisplayObject.js" />

var p;
/** DisplayObjectContainer Begin **/

Pyramid.DisplayObjectContainer = function() {
    if (this == Pyramid) return;
    Pyramid.DisplayObject.call(this);
    var host = $PD
    (
        this,
        {
            $class: Pyramid.DisplayObjectContainer,
            children: [],
            mouseChildren: true,
            tabChildren: true,
            childParentProxy: null,
            onUpdateTimeline: function(currentFrame) {
                this.children.forEach(function(item) { $PM(item).updateTimeline(currentFrame); });
            },
            onChildUpdate: null,
            childUpdate: function(event) {
                if (typeof host.onChildUpdate == "function")
                    host.onChildUpdate(event.target());
            },

            onChildAdded: null,
            childAdded: function(child, index) {
                if (typeof this.onChildAdded == "function")
                    this.onChildAdded(child, index);
                child.addEventListener("update", this.childUpdate);
                var stage = this.$.stage();
                if (stage) {
                    $PM(child).addedToStage(stage);
                }
                child.dispatchEvent(Pyramid.Event.UpdateEvent);
            },

            onChildRemoved: null,
            childRemoved: function(child, index) {
                if (typeof this.onChildRemoved == "function")
                    this.onChildRemoved(child, index);
                child.removeEventListener("update", this.childUpdate);
                if (this.$.stage)
                    $PM(child).removedFromStage();
            },

            onAddedToStage: function(stage) {
                this.children.forEach
                    (
                        function(child) {
                            $PM(child).addedToStage(stage);
                        }
                    );
            },
            onRemovedFromStage: function(stage) {
                this.children.forEach
                    (
                        function(child) {
                            $PM(child).removedFromStage(stage);
                        }
                    );
            },
            onDispatchEvent: function(event) {
                if (event.bubbles()) {
                    this.children.some
                    (
                        function(child) {
                            child.dispatchEvent(event);
                            return event.bubbles();
                        }
                    );
                }
            },
            onBroadcastEvent: function(event) {
                this.children.forEach
                    (
                        function(child) {
                            child.broadcastEvent(event);
                        }
                    );
            },
            onUpdateMouse: function(type, x, y, btn, ctrl, shift, alt, meta) {
                if (this.$.mouseChildren()) {
                    this.children.forEach
                    (
                        function(child) {
                            if (child.visible()) {
                                $PM(child).updateMouse(type, x, y, btn, ctrl, shift, alt, meta);
                            }
                        }
                    );
                }
            },
            onFreezeUpdate: function(v) {
                this.children.forEach(function(child) { $PM(child).freezeUpdate(v); });
            }
        }
    );
};

Pyramid.DisplayObjectContainer.prototype = new Pyramid.DisplayObject;
p = Pyramid.DisplayObjectContainer.prototype;

p.numChildren = function() {
    /// <returns type="Number" />
    return $PM(this).children.length;
};

p.mouseChildren = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("mouseChildren", v);
};

p.tabChildren = function(v) {
    /// <returns type="Boolean" />
    return $PM(this)._setbool("tabChildren", v);
};

p.addChild = function(child, index) {
    /// <returns type="Pyramid.DisplayObject" />
    if (Pyramid.DisplayObject.POF(child)) {
        var host = $PM(this);
        if (!host.children.hasItem(child)) {
            index = Number(index);
            if (isNaN(index))
                index = host.children.length;
            if (index < 0 || index > host.children.length)
                index = host.children.length;
            host.children.splice(index, 0, child);
            $PM(child).setParent(host.childParentProxy || this);
            host.childAdded(child, index);
            host.update();
        }
    }
    return child;
};

p.addChildren = function() {
    var host = $PM(this);
    for (var i = 0; i < arguments.length; i++) {
        var child = arguments[i];
        if (Pyramid.DisplayObject.POF(child)) {
            if (!host.children.hasItem(child)) {
                index = host.children.length;
                host.children.push(child);
                $PM(child).setParent(host.childParentProxy || this);
                host.childAdded(child, index);
            }
        }
    }
    host.update();
};

p.removeChildAt = function(index) {
    /// <returns type="Pyramid.DisplayObject" />
    var host = $PM(this);
    index = Number(index);
    if (isNaN(index) || index < 0 || index >= host.children.length)
        return null;
    var child = host.children.splice(index, 1)[0];
    $PM(child).setParent(null);
    host.childRemoved(child, index);
    host.update();
    return child;
};

p.removeChild = function(child) {
    /// <returns type="Pyramid.DisplayObject" />
    return this.removeChildAt($PM(this).children.indexOf(child));
};

p.removeAllChildren = function() {
    var host = $PM(this);
    var ary = host.children.slice();
    host.children.length = 0;
    ary.forEach
    (
        function(item, index) {
            host.childRemoved(item, index);
        },
        this
    );
    host.update();
};

p.contains = function(child) {
    return $PM(this).children.hasItem(child);
};

p.getChildAt = function(index) {
    return $PM(this).children[index];
};

p.swapChildrenAt = function(index1, index2) {
    if (!Pyramid.IsPNUM(index1, index2))
        return;
    var host = $PM(this);
    if (index1 >= host.children.length || index2 >= host.children.length)
        return;
    var old = host.children[index1];
    host.children[index1] = host.children[index2];
    host.children[index2] = old;
    host.update();
};

p.swapChildren = function(child1, child2) {
    var host = $PM(this);
    this.swapChildrenAt(host.children.indexOf(child1), host.children.indexOf(child2));
};

p.getChildByName = function(name) {
    var v = null;
    host.children.some
    (
        function(item) {
            if (item.name() == name) {
                v = item;
                return true;
            }
            return false;
        }
    );
    return v;
};

p.getChildIndex = function(child) {
    return $PM(this).children.indexOf(child);
};

p.setChildIndex = function(child, index) {
    if (!Pyramid.IsNUM(index)) index = 0;
    var host = $PM(this);
    if (index < 0 || index >= host.children.length - 1) index = host.children.length - 1;
    var cindex = host.children.indexOf(child);
    if (cindex > -1) {
        host.children.splice(cindex, 1);
        host.children.splice(index, 0, child);
    }
};

p.getObjectsUnderPoint = function(pt) {
    var ary = [];
    if (Pyramid.Point.POF(pt)) {
        var host = $PM(this);
        host.children.forEach
        (
            function(item) {
                var rt = item.getBounds();
                if (rt.containsPoint(pt)) {
                    ary.push(item);
                    if (Pyramid.DisplayObjectContainer.POF(item)) {
                        ary = ary.concat(item.getObjectsUnderPoint(pt));
                    }
                }
            }
        );
    }
    return ary;
};

/** DisplayObjectContainer End **/
