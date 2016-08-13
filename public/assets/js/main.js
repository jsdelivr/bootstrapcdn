(function() {
    'use strict';

    window.tryIt = function (n) {
        window.location.search = 'theme=' + n;
    };

    /* eslint func-style: 0 */
    (function(win, doc) {
        var init = function() {
            var script = doc.createElement('script');

            script.type = 'text/javascript';

            if (typeof script.setAttribute !== 'undefined') {
                script.setAttribute('async', 'async');
            }

            script.src = '//' + (win.location.protocol === 'https:' ? 's3.amazonaws.com/cdx-radar/' : 'radar.cedexis.com/') + '01-10956-radar10.min.js';
            doc.body.appendChild(script);
        };

        if (win.addEventListener) {
            win.addEventListener('load', init, false);
        } else if (win.attachEvent) {
            win.attachEvent('onload', init);
        }

    })(window, document);

})();
