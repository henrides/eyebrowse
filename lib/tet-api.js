/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
var {Cc, Ci} = require('chrome')
window = require('sdk/window/utils').getMostRecentBrowserWindow();

function TetApi() {
    this.trackingStarted = false;
    this.worker = null;

    this.hbInterval = 3000;

    var host='localhost';
    var port=6555;
    var transport = Cc['@mozilla.org/network/socket-transport-service;1'].getService(Ci.nsISocketTransportService).createTransport(null, 0, host, port, null);

    this.inputStream = transport.openInputStream(0, 0, 0);
    this.outputStream = transport.openOutputStream(0, 0, 0);
}

TetApi.prototype.attachWorker = function (worker) {
    if (this.worker !== null) {
        // FIXME error
    }
    this.worker = worker;

    startTracking(this);
};

TetApi.prototype.detachWorker = function () {
    if (this.worker !== null) {
        this.worker = null;
        stopTracking(this);
    }
};

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
                if (tet.trackingStarted) {
                    var scale = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
                    var position = { top: jsonMsg.values.frame.avg.y, left: jsonMsg.values.frame.avg.x, scale: scale };

                    tet.worker.port.emit('gazePosition', position);
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
