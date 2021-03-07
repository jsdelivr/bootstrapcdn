(function() {
    'use strict';

    function handleGaEvent(event) {
        if (typeof event.target !== 'undefined') {
            var action = event.target.getAttribute('data-ga-action');
            var category = event.target.getAttribute('data-ga-category');
            var label = event.target.getAttribute('data-ga-label');
            var value = parseInt(event.target.getAttribute('data-ga-value'), 10);

            if (window.ga && category && action) {
                window.ga('send', 'event', category, action, label, value, {});
            }
        }
    }

    /* eslint-disable */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'G-WWCYVX0YTQ', 'bootstrapcdn.com');
    ga('set', 'anonymizeIp', true);
    ga('send', 'pageview');
    /* eslint-enable */

    window.addEventListener('click', handleGaEvent, false);
})();
