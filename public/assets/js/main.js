/* global Clipboard:true */

((() => {
    'use strict';

    function toggleInputCaret() {
        const selector = '.input-group-btn > button';
        const el = document.querySelectorAll(selector);

        function toggleCode(index) {
            const btnIcon = el[index].querySelector('span');

            el[index].addEventListener('click', () => {
                btnIcon.classList.toggle('caret-open');
            });
        }

        for (let i = 0, len = el.length; i < len; i++) {
            toggleCode(i);
        }
    }

    function selectTextCopyToClipboard() {
        const selector = 'input[type="text"]';
        const el = document.querySelectorAll(selector);
        const origHelpBlockText = 'Click to copy';

        for (let i = 0, len = el.length; i < len; i++) {
            el[i].addEventListener('focus', function(e) {
                e.preventDefault();
                this.select();

                const clipboardSnippets = new Clipboard(this, {
                    target(trigger) {
                        return trigger;
                    }
                });

                clipboardSnippets.on('success', (e) => {
                    let helpBlock = {};
                    const parentNextSibling = e.trigger.parentElement.nextElementSibling;

                    if (parentNextSibling &&
                        parentNextSibling.nodeName.toLowerCase() === 'span') {
                        helpBlock = parentNextSibling;
                    } else {
                        helpBlock = e.trigger.nextElementSibling;
                    }

                    helpBlock.innerHTML = 'Copied text to clipboard';
                });
            }, true);

            el[i].addEventListener('blur', function(e) {
                let helpBlock = {};
                const parentNextSibling = this.parentElement.nextElementSibling;

                if (parentNextSibling &&
                    parentNextSibling.nodeName.toLowerCase() === 'span') {
                    helpBlock = parentNextSibling;
                } else {
                    helpBlock = this.nextElementSibling;
                }

                e.preventDefault();
                helpBlock.innerHTML = origHelpBlockText;
            }, true);
        }
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
                    height: 525,
                    partner: 'tweetdeck'
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

        iframeEl.setAttribute('src', 'https://ghbtns.com/github-btn.html?user=MaxCDN&repo=bootstrap-cdn&type=watch&count=true');
        iframeEl.title = 'Star on GitHub';
        iframeEl.style.width = '110px';
        iframeEl.style.height = '20px';

        document.getElementById('ghbtns-badge').appendChild(iframeEl);
    }

    function googleAnalytics() {
        function gaEvent(e) {
            if (typeof e.target !== 'undefined') {
                const action = e.target.getAttribute('data-ga-action');
                const category = e.target.getAttribute('data-ga-category');
                const label = e.target.getAttribute('data-ga-label');
                const value = parseInt(e.target.getAttribute('data-ga-value'), 10);

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

    window.addEventListener('DOMContentLoaded', init, false);

    window.addEventListener('resize', initTwitterTimeline, false);
}))();
