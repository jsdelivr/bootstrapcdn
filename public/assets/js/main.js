/* global Clipboard:true */

((() => {
    'use strict';

    function toggleInputCaret() {
        const selector = '.input-group .dropdown-toggle';
        const elements = document.querySelectorAll(selector);

        elements.forEach((elem) => {
            elem.addEventListener('click', () => {
                elem.classList.toggle('dropdown-toggle-open');
            });
        });
    }

    function selectTextCopyToClipboard() {
        const selector = 'input[type="text"]';
        const elements = document.querySelectorAll(selector);
        const origHelpBlockText = 'Click to copy';

        elements.forEach((elem) => {
            elem.addEventListener('focus', (event) => {
                event.preventDefault();
                elem.select();

                const clipboardInputs = new Clipboard(elem, {
                    target(trigger) {
                        return trigger;
                    }
                });

                clipboardInputs.on('success', (event) => {
                    let helpBlock = {};
                    const parentNextSibling = event.trigger.parentElement.nextElementSibling;

                    if (parentNextSibling &&
                        parentNextSibling.nodeName.toLowerCase() === 'span') {
                        helpBlock = parentNextSibling;
                    } else {
                        helpBlock = event.trigger.nextElementSibling;
                    }

                    helpBlock.innerHTML = 'Copied text to clipboard';
                });
            }, true);

            elem.addEventListener('blur', (event) => {
                let helpBlock = {};
                const parentNextSibling = elem.parentElement.nextElementSibling;

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
        const timelineSelector = '.twitter-timeline-custom';
        const timelineRendered = `${timelineSelector} .twitter-timeline-rendered`;

        if (!window.matchMedia('(min-width: 992px)').matches || document.querySelector(timelineRendered) !== null) {
            return;
        }

        window.twttr.ready((twttr) => {
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
        const iframeEl = document.createElement('iframe');

        iframeEl.setAttribute('src', 'https://ghbtns.com/github-btn.html?user=MaxCDN&repo=bootstrapcdn&type=watch&count=true');
        iframeEl.title = 'Star on GitHub';
        iframeEl.style.width = '110px';
        iframeEl.style.height = '20px';

        document.getElementById('ghbtns-badge').appendChild(iframeEl);
    }

    function googleAnalytics() {
        function gaEvent(event) {
            if (typeof event.target !== 'undefined') {
                const action = event.target.getAttribute('data-ga-action');
                const category = event.target.getAttribute('data-ga-category');
                const label = event.target.getAttribute('data-ga-label');
                const value = parseInt(event.target.getAttribute('data-ga-value'), 10);

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


    function loadIubenda() {
        const elem = document.querySelector('.iubenda-embed');

        if (!elem) {
            return;
        }

        /* eslint-disable */
        (function(w, d) {
            var loader = function() {
                var s = d.createElement('script'),
                    tag = d.getElementsByTagName('script')[0];
                s.src = 'https://cdn.iubenda.com/iubenda.js';
                tag.parentNode.insertBefore(s, tag);
            };
            if (w.addEventListener) {
                w.addEventListener('load', loader, false);
            } else if (w.attachEvent) {
                w.attachEvent('onload', loader);
            } else {
                w.onload = loader;
            }
        })(window, document);
        /* eslint-enable */
    }

    function init() {
        toggleInputCaret();
        selectTextCopyToClipboard();
        loadGhBtn();
        loadTwitterScript();
        initTwitterTimeline();
        loadIubenda();
        googleAnalytics();
    }

    window.addEventListener('DOMContentLoaded', init, false);

    window.addEventListener('resize', initTwitterTimeline, false);
}))();
