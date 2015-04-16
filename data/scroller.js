/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
$(function () {
	var trackerId = 'scroller';

	function createScrollerRegion(region) {
		$body.append('<div id="eb-'+region+'-scroller">&nbsp;</div>');
		$('#eb-'+region+'-scroller').css({
			'background-color': '#75f617',
			'opacity': '0.1',
			'pointer-events': 'none',
			'position': 'fixed',
			'top': regions[region].position.top,
			'left': regions[region].position.left,
			'height' : regions[region].dimension.height,
			'width': regions[region].dimension.width
		});
	}

	var $body = $('body');
	var innerHeight = window.innerHeight;
	var innerWidth = window.innerWidth;
	var scroolSpeed = 5;

	var regions = {
		bottom: {
			position: { top: innerHeight*0.8, left: 0 },
			dimension: { height: innerHeight*0.2, width: innerWidth }
		},
		top: {
			position: { top: 0, left: 0 },
			dimension: { height: innerHeight*0.2, width: innerWidth }
		}
	};

	for (region in regions) {
		createScrollerRegion(region);
	}

	var scrollDownInterval = null;
	function scrollDown() {
		var scrolled = $('html,body').scrollTop() + scroolSpeed;
		$('html,body').animate({scrollTop: scrolled}, 0);
	}

	var scrollUpInterval = null;
	function scrollUp() {
		var scrolled = $('html,body').scrollTop() - scroolSpeed;
		if (scrolled < 0) {
			scrolled = 0;
		}
		$('html,body').animate({scrollTop: scrolled}, 0);
	}

	self.port.on('gazeRegionEnter', function (region) {
		$('#eb-'+region+'-scroller').css({'opacity': '0.2'});
		if (region === 'bottom') {
			if (scrollDownInterval === null) {
				scrollDownInterval = setInterval(scrollDown, 50);
			}
		} else if (region === 'top') {
			if (scrollUpInterval === null) {
				scrollUpInterval = setInterval(scrollUp, 50);
			}
		}
	});

	self.port.on('gazeRegionLeave', function (region) {
		$('#eb-'+region+'-scroller').css({'opacity': '0.1'});
		if (region === 'bottom') {
			if (scrollDownInterval !== null) {
				clearInterval(scrollDownInterval);
				scrollDownInterval = null;
			}
		} else if (region === 'top') {
			if (scrollUpInterval !== null) {
				clearInterval(scrollUpInterval);
				scrollUpInterval = null;
			}
		}
	});

	self.port.emit('trackGazeRegion', trackerId, regions);
});
