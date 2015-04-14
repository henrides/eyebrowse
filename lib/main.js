var self = require('sdk/self');
var tabs = require('sdk/tabs');

var tet = require('./TetApi.js');
var eye = new tet.TetApi();

var button = require('sdk/ui/button/action').ActionButton({
	id: 'style-tab',
	label: 'Style Tab',
	icon: './icon-16.png',
	onClick: function() {
		tabs.activeTab.url = 'http://alt.dynu.com:8080';
	}
});

tabs.on('ready', function(tab) {
  worker = tab.attach({
	  contentScriptFile: [
		  self.data.url('jquery-2.1.1.js'),
		  //self.data.url('ContentModifier.js'),
		  self.data.url('scroller.js')
	  ]
  });
  worker.port.on('trackGazePosition', function() {
	  eye.addGazePositionObserver(worker);
  });
  worker.port.on('trackGazeRegion', function(regions) {
	  eye.addGazeRegionsObserver(worker, regions);
  });
  worker.port.on('stopTracking', function() {
	  eye.removeGazeObserver(worker);
  });
});

