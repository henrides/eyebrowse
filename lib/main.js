/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var { attach, detach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');
var sprefs = require('sdk/simple-prefs');

var tet = require('./tet-api.js');
var eye = new tet.TetApi();

var scriptFiles = null;
function evalScriptFiles() {
    scriptFiles = [
        self.data.url('jquery-2.1.1.js'),
        self.data.url('jquery-ui.min.js'),
        self.data.url('eye-browse.js')
    ];

    if (sprefs.prefs['clicker'] === true) {
        scriptFiles.push(self.data.url('clicker.js'));
    }
    if (sprefs.prefs['scroller'] === true) {
        scriptFiles.push(self.data.url('scroller.js'));
    }
    if (sprefs.prefs['pointer'] === true) {
        scriptFiles.push(self.data.url('pointer.js'));
    }
}
sprefs.on('clicker', evalScriptFiles);
sprefs.on('scroller', evalScriptFiles);
sprefs.on('pointer', evalScriptFiles);

var worker = null;
function attachWorker(tab) {
    if (scriptFiles === null) {
        evalScriptFiles();
    }
    worker = tab.attach({
        contentScriptFile: scriptFiles
    });
    var style = Style({
        uri: './clicker.css'
    });
    attach(style, tab);

    eye.attachWorker(worker);
    worker.on('detach', function() {
        eye.detachWorker();
        worker = null;
    });
}

tabs.on('ready', attachWorker);
tabs.on('activate', function (tab) {
    attachWorker(tab);
});
tabs.on('deactivate', function (tab) {
    worker.destroy();
});
