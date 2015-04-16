/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
var {Cc, Ci} = require('chrome')
window = require('sdk/window/utils').getMostRecentBrowserWindow();

function TetApi() {
    this.trackingStarted = false;
    this.trackingObservers = [];

    this.hbInterval = 3000;

    var host='localhost';
    var port=6555;
    var transport = Cc['@mozilla.org/network/socket-transport-service;1'].getService(Ci.nsISocketTransportService).createTransport(null, 0, host, port, null);

    this.inputStream = transport.openInputStream(0, 0, 0);
    this.outputStream = transport.openOutputStream(0, 0, 0);

    this.scale = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
}

TetApi.prototype.addGazePositionObserver = function(observer) {
    var newObserver = { trackingObserver: observer, trackGazePosition: true, trackGazeRegion: false, trackingRegions: null };
    this.trackingObservers.push(newObserver);

    startTracking(this);
}

TetApi.prototype.addGazeRegionsObserver = function(observer, regions) {
    var newObserver = { trackingObserver: observer, trackGazePosition: false, trackGazeRegion: true, trackingRegions: regions, activeRegions: [] };
    this.trackingObservers.push(newObserver);

    startTracking(this);
}

TetApi.prototype.removeGazeObserver = function(observer) {
    for (var i = 0; i < this.trackingObservers.length; ++i) {
        if (this.trackingObservers[i].trackingObserver === observer) {
            this.trackingObservers.splice(i,1);
            --i;
        }
    }

    if (this.trackingObservers.length === 0) {
        stopTracking(this);
    }
}

function startTracking(tet) {
    if (!tet.trackingStarted) {
        tet.trackingStarted = true;
        getInfo(tet);
        window.setTimeout(recvTetMessage, 200, tet);
    }
}

function stopTracking(tet) {
    if (tet.trackingStarted) {
        tet.trackingStarted = false;
        // FIXME actually stop the thing...
    }
}

function recvTetMessage(tet) {
    var sin = Cc['@mozilla.org/scriptableinputstream;1'].createInstance(Ci.nsIScriptableInputStream);

    sin.init(tet.inputStream);
    var request = '';
    while (sin.available()) {
        request = request + sin.read(1024);
    }

    if (request.length > 0) {
        requests = request.split('\n');
        for (i = 0; i < requests.length; i++)
        {
            if (requests[i].length > 0) {
                //console.log('Received: (' + requests[i].length + ') ' + requests[i]);
                var jsonMsg = JSON.parse(requests[i]);
                processTetMessage(tet, jsonMsg);
            }
        }
    }

    window.setTimeout(recvTetMessage, 200, tet);
}

function sendTetMessage(tet, request) {
    var jsonStr = JSON.stringify(request);
    tet.outputStream.write(jsonStr, jsonStr.length);
}

function convertTrackerPositionToViewPort(pos, scale) {
    return {
        top: (pos.y/scale) - window.mozInnerScreenY,
        left: (pos.x/scale) - window.mozInnerScreenX
    };
}

function isGazeInRegion(position, region) {
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
    //console.log('region ' + region.data + ' distance = ' + xDist + ' ' + yDist);

    return (xDist === 0 && yDist === 0);
}

function processTetMessage(tet, jsonMsg) {
    if (jsonMsg.category === 'tracker' && jsonMsg.statuscode === 200)
    {
        if (jsonMsg.request === 'get')
        {
            if (jsonMsg.values.iscalibrated === true)
            {
                setPush(tet);
                tet.hbInterval = jsonMsg.values.heartbeatinterval;
            }
            if (jsonMsg.values.frame)
            {
                var position = convertTrackerPositionToViewPort(jsonMsg.values.frame.avg, tet.scale);

                for (var i = 0; i < tet.trackingObservers.length; ++i) {
                    var observer = tet.trackingObservers[i];

                    if (observer.trackGazePosition) {
                        observer.trackingObserver.worker.port.emit('gazePosition', position);
                    }
                    if (observer.trackGazeRegion) {
                        for (var reg in observer.trackingRegions) {
                            var region = observer.trackingRegions[reg];
                            var arIndex = observer.activeRegions.indexOf(reg);

                            if (isGazeInRegion(position, region)) {
                                if (arIndex < 0) {
                                    observer.trackingObserver.worker.port.emit('gazeRegionEnter', reg);
                                    observer.activeRegions.push(reg);
                                }
                            } else {
                                if (arIndex >= 0) {
                                    observer.trackingObserver.worker.port.emit('gazeRegionLeave', reg);
                                    observer.activeRegions.splice(arIndex, 1);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (jsonMsg.request === 'set')
        {
            window.setTimeout(heartbeat, tet.hbInterval, tet);
        }
    }
    if (jsonMsg.category === 'heartbeat')
    {
        if (jsonMsg.statuscode === 200)
        {
            window.setTimeout(heartbeat, tet.hbInterval, tet);
        }
    }
}

function setPush(tet) {
    var pushRequest = {
        'category': 'tracker',
        'request':'set',
        'values':{
            'push':true,
            'version':1
        }
    };
    sendTetMessage(tet, pushRequest);
}

function heartbeat(tet) {
    hbRequest = {
        'category': 'heartbeat'
    };
    sendTetMessage(tet, hbRequest);
}

function getInfo(tet) {
    var getRequest = {
        'category': 'tracker',
        'request': 'get',
        'values' : [
            'push',
            'iscalibrated',
            'heartbeatinterval'
        ]
    }
    sendTetMessage(tet, getRequest);
}

exports.TetApi = TetApi;
