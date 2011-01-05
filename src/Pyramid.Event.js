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
var p;

Pyramid.Event = function(type, bubbles, cancelable) {
    if (this == Pyramid) return;
    Pyramid.Object.call(this, arguments);
    $PD
    (
        this,
        {
            $class: Pyramid.Event,
            $properties: ["type", "bubbles", "cancelable", "target", "currentTarget", "cancelled"],
            type: type,
            bubbles: bubbles,
            cancelable: cancelable,
            target: null,
            currentTarget: null,
            cancelled: false,
            propagatable: true
        }
    );
};

Pyramid.Event.prototype = new Pyramid.Object;

var p = Pyramid.Event.prototype;

p.type = function() {
    /// <returns type="String" />
    return $PM(this).type;
};
p.bubbles = function() {
    /// <returns type="Boolean" />
    return $PM(this).bubbles && $PM(this).propagatable;
};
p.cancelable = function() {
    /// <returns type="Boolean" />
    return $PM(this).cancelable;
};
p.target = function() {
    /// <returns type="Pyramid.Object" />
    return $PM(this).target;
};
p.currentTarget = function() {
    /// <returns type="Pyramid.Object" />
    return $PM(this).currentTarget;
};
p.stopPropagation = function() {
    if ($PM(this).bubles)
        $PM(this).propagatable = false;
};
p.preventDefault = function() {
    if ($PM(this).cancelable)
        $PM(this).cancelled = true;
};
p.cancelled = function() {
    /// <returns type="Boolean" />
    return $PM(this).cancelled;
};

/** DefaultEvents Begin **/
Pyramid.Event.RenderEvent = new Pyramid.Event("render", false, false);
Pyramid.Event.PositionChangeEvent = new Pyramid.Event("positionChange", false, false);
Pyramid.Event.UpdateEvent = new Pyramid.Event("update", false, false);
Pyramid.Event.EnterFrameEvent = new Pyramid.Event("enterFrame", false, false);
Pyramid.Event.LeaveFrameEvent = new Pyramid.Event("leaveFrame", false, false);
Pyramid.Event.AddedToStage = new Pyramid.Event("addedToStage", true, false);
Pyramid.Event.RemovedFromStage = new Pyramid.Event("removedFromStage", true, false);
Pyramid.Event.Added = new Pyramid.Event("added", true, false);
Pyramid.Event.Removed = new Pyramid.Event("removed", true, false);
/** DefaultEvents End **/


Pyramid.Event.KeyboardEvent = function(type, bubbles, cancelable, key, charCode, meta, alt, ctrl, shift) {
    if (this == Pyramid.Event) return;
    Pyramid.Event.call(this, type, bubbles, cancelable);
    $PD
    (
        this,
        {
            $class: Pyramid.Event.KeyboardEvent,
            $properties: ["key", "char", "meta", "alt", "ctrl", "shift"],
            key: key ,
            charCode: charCode,
            meta: meta,
            alt: alt,
            ctrl: ctrl,
            shift: shift
        }
    );
};

p = Pyramid.Event.KeyboardEvent.prototype = new Pyramid.Event;

p.key = function() {
    /// <returns type="Number" />
    return $PM(this).key;
};

p.charCode = function() {
    /// <returns type="Number" />
    return $PM(this).charCode;
};
p.meta = function() {
    /// <returns type="Number" />
    return $PM(this).meta;
};
p.alt = function() {
    /// <returns type="Boolean" />
    return $PM(this).alt;
};
p.ctrl = function() {
    /// <returns type="Boolean" />
    return $PM(this).ctrl; 
};
p.shift = function() {
    /// <returns type="Boolean" />
    return $PM(this).shift;
};

Pyramid.Event.PropertyChangeEvent = function(type, bubbles, cancelable, name, oldValue, newValue) {
    if (this == Pyramid.Event) return;
    Pyramid.Event.call(this, type, bubbles, cancelable);
    $PD
    (
        this,
        {
            $class: Pyramid.Event.PositionChangeEvent,
            $properties: ["name", "oldValue", "newValue"],
            name:name,
            oldValue: oldValue,
            newValue:newValue
        }
    );
};
p = Pyramid.Event.PropertyChangeEvent.prototype = new Pyramid.Event;

p.name = function() {
    /// <returns type="String" />
    return $PM(this).name;
};
p.oldValue = function() {
    /// <returns type="Object" />
    return $PM(this).oldValue;
};
p.newValue = function() {
    /// <returns type="Object" />
    return $PM(this).newValue;
};

Pyramid.Event.MouseEvent = function(type, bubbles, cancelable, x, y, button, ctrl, shift, alt, meta) {
    if (this == Pyramid.Event) return;
    Pyramid.Event.call(this, type, bubbles, cancelable);
    $PD
        (
            this,
            {
                $class: Pyramid.Event.KeyboardEvent,
                $properties: ["button", "x", "y", "meta", "alt", "ctrl", "shift"],
                x: x,
                y: y,
                button:button,
                key: key,
                meta: meta,
                alt: alt,
                ctrl: ctrl,
                shift: shift
            }
        );

};

var p = Pyramid.Event.MouseEvent.prototype = new Pyramid.Event;

p.x = function() {
    /// <returns type="Number" />
    return $PM(this).x;
};
p.y = function() {
    /// <returns type="Number" />
    return $PM(this).y;
};
p.button = function() {
    /// <returns type="Number" />
    return $PM(this).button;
};
p.meta = function() {
    /// <returns type="Number" />
    return $PM(this).meta;
};
p.alt = function() {
    /// <returns type="Boolean" />
    return $PM(this).alt;
};
p.ctrl = function() {
    /// <returns type="Boolean" />
    return $PM(this).ctrl;
};
p.shift = function() {
    /// <returns type="Boolean" />
    return $PM(this).shift;
};
