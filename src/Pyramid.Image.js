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

Pyramid.Image = function(src) {
    if (this == Pyramid) return;
    Pyramid.DisplayObject.call(this, arguments);

    var img = document.createElement("img");

    var host = $PD
    (
        this,
        {
            $class: Pyramid.Image,
            element: img,
            onRender: function(canvas, context, x, y, w, h) {
                if (!img.width || !context) return null;

                context.drawImage(img, 0, 0);

                return this.getUnscaledBounds();
            },
            getUnscaledBounds: function() {
                return { x: 0, y: 0, width: img.width, height: img.height };
            }
        }
    );

    function callUpdate() {
        host.update();
    }

    $PAV("error", img, callUpdate);
    $PAV("load", img, callUpdate);
    $PAV("timeupdate", img, callUpdate);

    if (Pyramid.IsFSTR(src)) img.src = src;
};

var p = Pyramid.Image.prototype = new Pyramid.DisplayObject;

p.imgElement = function() {
    return $PM(this).element;
};

p.clone = function() {
    return new Pyramid.Image(this.imgElement().src);
};