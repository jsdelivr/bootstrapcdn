/* eslint-env browser */

(function() {
    'use strict';
    window.tryIt = function (n) {
        window.location.search = 'theme=' + n;
    };

    window.toggleCode = function (el, name) {
        $('#' + name).toggleClass('hidden');
        $(el).find('i').toggleClass('fa-caret-down');
        $(el).find('i').toggleClass('fa-caret-up');
    };
})();

(function() {
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
})();

/* eslint-disable */
(function(e,t){var n=function(){var n=t.createElement("script");n.type="text/javascript";if(undefined!==n.setAttribute){n.setAttribute("async","async")}n.src="//"+(e.location.protocol==="https:"?"s3.amazonaws.com/cdx-radar/":"radar.cedexis.com/")+"01-10956-radar10.min.js";t.body.appendChild(n)};if(e.addEventListener){e.addEventListener("load",n,false)}else if(e.attachEvent){e.attachEvent("onload",n)}})(window,document)
/* eslint-enable */
