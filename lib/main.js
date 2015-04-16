/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var { attach, detach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');

var tet = require('./TetApi.js');
var eye = new tet.TetApi();

tabs.on('ready', function(tab) {
    worker = tab.attach({
        contentScriptFile: [
            self.data.url('jquery-2.1.1.js'),
            self.data.url('jquery-ui.min.js'),
            self.data.url('pointer.js'),
            //self.data.url('clicker.js')
            self.data.url('scroller.js')
        ]
    });
    var style = Style({
        uri: './clicker.css'
    });
    attach(style, tab);

    worker.port.on('trackGazePosition', function(trackerId) {
        eye.addGazePositionObserver({worker: worker, trackerId: trackerId});
    });
    worker.port.on('trackGazeRegion', function(trackerId, regions) {
        eye.addGazeRegionsObserver({worker: worker, trackerId: trackerId}, regions);
    });
    worker.port.on('stopTracking', function(trackerId) {
        eye.removeGazeObserver({worker: worker, trackerId: trackerId});
    });
});

