/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
$(function () {
	eyeBrowse.registerPositionListener(function (position) {
        $('#eb-pointer').css({
            'top': position.top,
            'left': position.left
        });
    });

    var togglePointer = false;
    $('body').keydown(function(key){
        if (key.altKey && key.ctrlKey) {
            if (!togglePointer) {
                $('body').append('<div id="eb-pointer">&nbsp;</div>');
                $('#eb-pointer').css({
                    'position': 'fixed',
                    'background-color': 'black',
					'pointer-events': 'none',
                    'height': '5px',
                    'width': '5px'
                });
                togglePointer = true;
            } else {
                $('#eb-pointer').remove();
                togglePointer = false;
            }
        }
    });
});

