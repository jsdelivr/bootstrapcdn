(function($) {
    'use strict';

    $('input:text').focus(function() {
        $(this).select();
        $(this).mouseup(function(a) {
            a.preventDefault();
        });
    });

})(jQuery);
