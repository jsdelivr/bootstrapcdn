/* global ClipboardJS:false */

(function () {
    'use strict';

    function toggleInputCaret() {
        var selector = '.input-group .dropdown-toggle';
        var elements = document.querySelectorAll(selector);

        function toggleCode(index) {
            elements[index].addEventListener('click', function () {
                elements[index].classList.toggle('dropdown-toggle-open');
            });
        }

        for (var i = 0, len = elements.length; i < len; i++) {
            toggleCode(i);
        }
    }

    function selectTextCopyToClipboard() {
        var selector = 'input[type="text"]';
        var elements = document.querySelectorAll(selector);
        var origHelpBlockText = 'Click to copy';

        for (var i = 0, len = elements.length; i < len; i++) {
            elements[i].addEventListener('focus', function (event) {
                event.preventDefault();
                this.select();

                var clipboardInputs = new ClipboardJS(this, {
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

            elements[i].addEventListener('blur', function (event) {
                var helpBlock = {};
                var parentNextSibling = this.parentElement.nextElementSibling;

                if (parentNextSibling &&
                    parentNextSibling.nodeName.toLowerCase() === 'span') {
                    helpBlock = parentNextSibling;
                } else {
                    helpBlock = this.nextElementSibling;
                }

                event.preventDefault();
                helpBlock.innerHTML = origHelpBlockText;
            }, true);
        }
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

    function init() {
        toggleInputCaret();
        selectTextCopyToClipboard();
        loadTwitterScript();
        initTwitterTimeline();
    }

    init();

    window.addEventListener('resize', initTwitterTimeline, false);
})();
