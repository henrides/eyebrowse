/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
var eyeBrowse;

(function ($) {
    self.port.on('gazePosition', function (position) {
        eyeBrowse.processPosition(position);
    });

    var EyeBrowse = function() {
        if (EyeBrowse.prototype._singletonInstance) {
            return EyeBrowse.prototype._singletonInstance;
        }
        EyeBrowse.prototype._singletonInstance = this;

        this.listener = [];
        this.previousElement = null;

        EyeBrowse.prototype.registerPositionListener = function (callback) {
            this.listener.push({type: 'position', callback: callback});
        };

        EyeBrowse.prototype.registerElementListener = function (elements, callback) {
            this.listener.push({type: 'region', regions: regions, callback: callback});
        };

        function convertScreenPositionToViewPort(position) {
            return {
                top: (position.top/position.scale) - window.mozInnerScreenY,
                left: (position.left/position.scale) - window.mozInnerScreenX
            };
        }

        EyeBrowse.prototype.processPosition = function (position) {
            var listener,
                viewPortPosition = convertScreenPositionToViewPort(position);
            for (var i = 0; i < this.listener.length; ++i) {
                listener = this.listener[i];

                if (listener.type === 'position') {
                    listener.callback(viewPortPosition);
                }
            }
        };

        EyeBrowse.prototype.getDistanceToRegion = function (position, region) {
            var xDist,
                yDist;

            if (position.left < region.position.left) {
                xDist = region.position.left - position.left;
            } else if (position.left > (region.position.left + region.dimension.width)) {
                xDist = position.left - (region.position.left + region.dimension.width);
            } else {
                xDist = 0;
            }

            if (position.top < region.position.top) {
                yDist = region.position.top - position.top;
            } else if (position.top > (region.position.top + region.dimension.height)) {
                yDist = position.top - (region.position.top + region.dimension.height);
            } else {
                yDist = 0;
            }

            return Math.sqrt((xDist*xDist)+(yDist*yDist));
        }
    }

    eyeBrowse = new EyeBrowse();
}(jQuery));
