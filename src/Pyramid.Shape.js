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

/// <reference path="Pyramid.GraphicsElement.js" />
var p;
/** Shape Begin   **/
Pyramid.Shape = function() {
    if (this == Pyramid) return;
    Pyramid.GraphicsElement.call(this);
    $PD
    (
        this,
        {
            $class: Pyramid.Shape
        }
    );
};

Pyramid.Shape.prototype = new Pyramid.GraphicsElement;
/** Shape End   **/

