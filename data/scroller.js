/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
$(function () {

    function scrollDown() {
        var scrolled = $('html,body').scrollTop() + scroolSpeed;
        $('html,body').animate({scrollTop: scrolled}, 0);
    }

    function scrollUp() {
        var scrolled = $('html,body').scrollTop() - scroolSpeed;
        if (scrolled < 0) {
            scrolled = 0;
        }
        $('html,body').animate({scrollTop: scrolled}, 0);
    }

    var scroolSpeed = 5;
    var scrollDownInterval = null;
    var scrollUpInterval = null;

    var $body = $('body');
    var innerHeight = window.innerHeight;
    var innerWidth = window.innerWidth;

    var regions = [
        {
            name: 'bottom',
            position: { top: innerHeight*0.8, left: 0 },
            dimension: { height: innerHeight*0.2, width: innerWidth },
            isActive: false
        },
        {
            name: 'top',
            position: { top: 0, left: 0 },
            dimension: { height: innerHeight*0.2, width: innerWidth },
            isActive: false
        }
    ];

	eyeBrowse.registerPositionListener(function (position) {
        for (var i = 0; i < regions.length; ++i) {
            var region = regions[i];
            if (eyeBrowse.getDistanceToRegion(position, region) === 0) {
                if (!region.isActive) {
                    region.isActive = true;
                    if (region.name === 'bottom') {
                        if (scrollDownInterval === null) {
                            scrollDownInterval = setInterval(scrollDown, 50);
                        }
                    } else if (region.name === 'top') {
                        if (scrollUpInterval === null) {
                            scrollUpInterval = setInterval(scrollUp, 50);
                        }
                    }
                }
            } else {
                if (region.isActive) {
                    region.isActive = false;
                    if (region.name === 'bottom') {
                        if (scrollDownInterval !== null) {
                            clearInterval(scrollDownInterval);
                            scrollDownInterval = null;
                        }
                    } else if (region.name === 'top') {
                        if (scrollUpInterval !== null) {
                            clearInterval(scrollUpInterval);
                            scrollUpInterval = null;
                        }
                    }
                }
            }
        }
    });

    /*
    function createScrollerRegion(region) {
        $body.append('<div id="eb-'+region+'-scroller">&nbsp;</div>');
        $('#eb-'+region+'-scroller').css({
            'background-color': '#75f617',
            'opacity': '0.1',
            //'pointer-events': 'none',
            'position': 'fixed',
            'top': regions[region].position.top,
            'left': regions[region].position.left,
            'height' : regions[region].dimension.height,
            'width': regions[region].dimension.width
        });
    }

    for (region in regions) {
        createScrollerRegion(region);
    }

    $('#eb-bottom-scroller').on('gazeEnter', function () {
        $('#eb-bottom-scroller').css({'opacity': '0.2'});
        if (scrollDownInterval === null) {
            scrollDownInterval = setInterval(scrollDown, 50);
        }
    });

    $('#eb-bottom-scroller').on('gazeLeave', function () {
        $('#eb-bottom-scroller').css({'opacity': '0.1'});
        if (scrollDownInterval !== null) {
            clearInterval(scrollDownInterval);
            scrollDownInterval = null;
        }
    });

    $('#eb-top-scroller').on('gazeEnter', function () {
        $('#eb-top-scroller').css({'opacity': '0.2'});
        if (scrollUpInterval === null) {
            scrollUpInterval = setInterval(scrollUp, 50);
        }
    });

    $('#eb-top-scroller').on('gazeLeave', function () {
        $('#eb-top-scroller').css({'opacity': '0.1'});
        if (scrollUpInterval !== null) {
            clearInterval(scrollUpInterval);
            scrollUpInterval = null;
        }
    });
    */

    /*
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
    */
});
