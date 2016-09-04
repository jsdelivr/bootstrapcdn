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


    (function() {
        function loadGhbtns() {
            var iframeEl = document.createElement('iframe');

            iframeEl.setAttribute('src', 'https://ghbtns.com/github-btn.html?user=MaxCDN&repo=bootstrap-cdn&type=watch&count=true');
            iframeEl.title = 'Star on GitHub';
            iframeEl.style.width = '110px';
            iframeEl.style.height = '20px';

            document.getElementById('ghbtns-badge').appendChild(iframeEl);
        }

        /* eslint-disable */
        function loadTwitter() {
            window.twttr = (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0],
                    t = window.twttr || {};
                if (d.getElementById(id)) return t;
                js = d.createElement(s);
                js.id = id;
                js.src = 'https://platform.twitter.com/widgets.js';
                fjs.parentNode.insertBefore(js, fjs);

                t._e = [];
                t.ready = function(f) {
                    t._e.push(f);
                };

                return t;
            }(document, 'script', 'twitter-wjs'));
        }
        /* eslint-enable */

        function onLoad() {
            loadGhbtns();
            loadTwitter();
        }

        if (window.addEventListener) {
            window.addEventListener('load', onLoad, false);
        } else if (window.attachEvent) {
            window.attachEvent('onload', onLoad);
        } else {
            window.onload = onLoad;
        }
    })();


    (function () {
        function gaEvent(e) {
            if (typeof e.target !== 'undefined') {
                var action = e.target.getAttribute('data-ga-action');
                var category = e.target.getAttribute('data-ga-category');
                var label = e.target.getAttribute('data-ga-label');
                var value = parseInt(e.target.getAttribute('data-ga-value'), 10);

                if (typeof ga !== 'undefined' && typeof category !== 'undefined' && typeof action !== 'undefined') {
                    window.ga('send', 'event', category, action, label, value, {});
                }
            }
        }

        /* eslint-disable */
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-32253110-1', 'bootstrapcdn.com');
        ga('send', 'pageview');

        if (window.addEventListener) {
            window.addEventListener('click', gaEvent, false);
        } else if (window.attachEvent) {
            window.attachEvent('click', gaEvent);
        } else {
            window.onclick = gaEvent;
        }
        /* eslint-enable */
    })();

})();
