/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
$(function () {
    var snapDistance = 50;
    var toggleTabbable = false;
    var $currentElem = null;
    var $tabbableElems = null

	eyeBrowse.registerPositionListener(function (position) {
        if (!toggleTabbable) {
            return;
        }

        var $closestElem = null;
        var closestElemDist = null;
        $tabbableElems.each(function () {
            var rect = this.getBoundingClientRect();
            var region = {
                position: { top: rect.top, left: rect.left },
                dimension: { height: rect.height, width: rect.width }
            };
            var dist = eyeBrowse.getDistanceToRegion(position, region);
            if ($closestElem === null || dist < closestElemDist) {
                $closestElem = $(this);
                closestElemDist = dist;
            }
        });

        if (closestElemDist === null || closestElemDist > snapDistance) {
            $closestElem = null;
        }

        if ($currentElem !== $closestElem) {
            if ($currentElem !== null) {
                $currentElem.removeClass('eb-clicker-hover');
            }
            if ($closestElem !== null) {
                $closestElem.addClass('eb-clicker-hover');
            }
            $currentElem = $closestElem;
        }
    });

    $('body').keydown(function(key){
        if (key.altKey && key.ctrlKey) {
            toggleTabbable = !toggleTabbable;
            if (!toggleTabbable) {
                if ($currentElem !== null) {
                    $currentElem.removeClass('eb-clicker-hover');
                    var evt = new MouseEvent('click', {
                        'bubbles': true,
                        'cancelable': false
                    });
                    $currentElem[0].dispatchEvent(evt);
                    $currentElem = null;
                }
            } else {
                $tabbableElems = $(':tabbable');
            }
            $(':tabbable').toggleClass('eb-clicker-tabbable', toggleTabbable);
        }
    });
});

