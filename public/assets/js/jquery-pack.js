(function($) {
    'use strict';

    $('input:text').focus(function() {
        $(this).select();
        $(this).mouseup(function(a) {
            a.preventDefault();
        });
    });

    $('.alert-dismissible').each(function() {
        var $alert = $(this);
        var alertNameLSProp = $alert.attr('data-alert-id');

        if (localStorage.getItem(alertNameLSProp) === 'true') {
            $alert.remove();
        } else {
            $alert.on('close.bs.alert', function() {
                localStorage.setItem(alertNameLSProp, true);
            });
        }
    });

})(jQuery);
