/*
 * Copyright (c) 2015, Marc-Olivier Mercier
 * All rights reserved
 */
$(function () {
    var trackerId = 'clicker';

    var toggleTabbable = false;
    $('body').keydown(function(key){
        if (key.altKey && key.ctrlKey) {
            toggleTabbable = !toggleTabbable;
            window.console.log('toggle = ' + toggleTabbable);
            $(':tabbable').toggleClass('eb-clicker-tabbable', toggleTabbable);
        }
    });
});

