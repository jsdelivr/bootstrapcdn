(function() {
    'use strict';

    (function () {
        var el = document.querySelectorAll('.input-group-btn > button');

        function toggleCode (index) {
            var name = el[index].getAttribute('data-el');
            var btnIcon = el[index].querySelector('span');

            el[index].addEventListener('click', function() {
                document.getElementById(name).classList.toggle('hidden');
                btnIcon.classList.toggle('caret-open');
            });
        }

        if (el) {
            for (var i = 0, len = el.length; i < len; i++) {
                toggleCode(i);
            }
        }
    })();

    (function () {
        var el = document.querySelectorAll('input[type="text"');

        if (el) {
            for (var i = 0, len = el.length; i < len; i++) {
                el[i].addEventListener('focus', function() {
                    this.select();
                });
                el[i].addEventListener('mouseup', function(a) {
                    a.preventDefault();
                });
            }
        }
    })();

    window.toggleCode = function (el, name) {
        var wellContainer = document.querySelector('#' + name);
        var btnIcon = el.querySelector('span');

        if (wellContainer) {
            wellContainer.classList.toggle('hidden');
            btnIcon.classList.toggle('caret-open');
        }
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

    /* eslint-disable */
    window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
        if (d.getElementById(id)) return t;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);

        t._e = [];
        t.ready = function(f) {
            t._e.push(f);
        };

        return t;
    }(document, "script", "twitter-wjs"));


    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-32253110-1', 'bootstrapcdn.com');
    ga('send', 'pageview');
    /* eslint-enable */

})();
