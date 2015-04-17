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
            self.data.url('eye-browse.js'),
            self.data.url('pointer.js'),
            self.data.url('scroller.js'),
            self.data.url('clicker.js')
        ]
    });
    var style = Style({
        uri: './clicker.css'
    });
    attach(style, tab);

    eye.attachWorker(worker);

});

