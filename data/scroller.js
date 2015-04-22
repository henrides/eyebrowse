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
                            $('#eb-bottom-scroller').css({'opacity': '0.2'});
                            scrollDownInterval = setInterval(scrollDown, 50);
                        }
                    } else if (region.name === 'top') {
                        if (scrollUpInterval === null) {
                            $('#eb-top-scroller').css({'opacity': '0.2'});
                            scrollUpInterval = setInterval(scrollUp, 50);
                        }
                    }
                }
            } else {
                if (region.isActive) {
                    region.isActive = false;
                    if (region.name === 'bottom') {
                        if (scrollDownInterval !== null) {
                            $('#eb-bottom-scroller').css({'opacity': '0.1'});
                            clearInterval(scrollDownInterval);
                            scrollDownInterval = null;
                        }
                    } else if (region.name === 'top') {
                        if (scrollUpInterval !== null) {
                            $('#eb-top-scroller').css({'opacity': '0.1'});
                            clearInterval(scrollUpInterval);
                            scrollUpInterval = null;
                        }
                    }
                }
            }
        }
    });

    function createScrollerRegion(region) {
        $('body').append('<div id="eb-'+region.name+'-scroller">&nbsp;</div>');
        $('#eb-'+region.name+'-scroller').css({
            'background-color': '#75f617',
            'opacity': '0.1',
            'pointer-events': 'none',
            'position': 'fixed',
            'top': region.position.top,
            'left': region.position.left,
            'height' : region.dimension.height,
            'width': region.dimension.width
        });
    }

    for (var i = 0; i < regions.length; ++i) {
        createScrollerRegion(regions[i]);
    }

});
