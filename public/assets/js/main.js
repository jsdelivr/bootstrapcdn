/* global ClipboardJS:false */

(function () {
    'use strict';

    function toggleInputCaret() {
        var selector = '.input-group .dropdown-toggle';
        var elements = document.querySelectorAll(selector);

        elements.forEach(function (elem) {
            elem.addEventListener('click', function () {
                elem.classList.toggle('dropdown-toggle-open');
            });
        });
    }

    function selectTextCopyToClipboard() {
        var selector = 'input[type="text"]';
        var elements = document.querySelectorAll(selector);
        var origHelpBlockText = 'Click to copy';

        elements.forEach(function (elem) {
            elem.addEventListener('focus', function (event) {
                event.preventDefault();
                elem.select();

                var clipboardInputs = new ClipboardJS(elem, {
                    target: function (trigger) {
                        return trigger;
                    }
                });

                clipboardInputs.on('success', function (ev) {
                    var helpBlock = {};
                    var parentNextSibling = ev.trigger.parentElement.nextElementSibling;

                    if (parentNextSibling &&
                        parentNextSibling.nodeName.toLowerCase() === 'span') {
                        helpBlock = parentNextSibling;
                    } else {
                        helpBlock = ev.trigger.nextElementSibling;
                    }

                    helpBlock.innerHTML = 'Copied text to clipboard';
                });
            }, true);

            elem.addEventListener('blur', function (event) {
                var helpBlock = {};
                var parentNextSibling = elem.parentElement.nextElementSibling;

                if (parentNextSibling &&
                    parentNextSibling.nodeName.toLowerCase() === 'span') {
                    helpBlock = parentNextSibling;
                } else {
                    helpBlock = elem.nextElementSibling;
                }

                event.preventDefault();
                helpBlock.innerHTML = origHelpBlockText;
            }, true);
        });
    }

    function initTwitterTimeline() {
        var timelineSelector = '.twitter-timeline-custom';
        var timelineRendered = timelineSelector + ' .twitter-timeline-rendered';

        if (!window.matchMedia('(min-width: 992px)').matches || document.querySelector(timelineRendered) !== null) {
            return;
        }

        window.twttr.ready(function (twttr) {
            twttr.widgets.createTimeline(
                {
                    sourceType: 'collection',
                    id: '770731482377621505'
                },
                document.querySelector(timelineSelector),
                {
                    dnt: true,
                    partner: 'tweetdeck',
                    tweetLimit: 4
                }
            );
        });
    }

    function loadTwitterScript() {
        /* eslint-disable */
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
        /* eslint-enable */
    }

    function loadGhBtn() {
        var iframeEl = document.createElement('iframe');

        iframeEl.setAttribute('src', 'https://ghbtns.com/github-btn.html?user=MaxCDN&repo=bootstrapcdn&type=watch&count=true');
        iframeEl.title = 'Star on GitHub';
        iframeEl.style.width = '88px';
        iframeEl.style.height = '20px';

        document.getElementById('ghbtns-badge').appendChild(iframeEl);
    }

    function googleAnalytics() {
        function gaEvent(event) {
            if (typeof event.target !== 'undefined') {
                var action = event.target.getAttribute('data-ga-action');
                var category = event.target.getAttribute('data-ga-category');
                var label = event.target.getAttribute('data-ga-label');
                var value = parseInt(event.target.getAttribute('data-ga-value'), 10);

                if (typeof window.ga !== 'undefined' && typeof category !== 'undefined' && typeof action !== 'undefined') {
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

        window.addEventListener('click', gaEvent, false);
        /* eslint-enable */
    }

    function init() {
        toggleInputCaret();
        selectTextCopyToClipboard();
        loadGhBtn();
        loadTwitterScript();
        initTwitterTimeline();
        googleAnalytics();
    }

    init();

    window.addEventListener('resize', initTwitterTimeline, false);
})();
