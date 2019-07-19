/* global ClipboardJS:false */

(function() {
    'use strict';

    function toggleInputCaret() {
        var elements = document.querySelectorAll('.input-group .dropdown-toggle');

        Array.prototype.forEach.call(elements, function(element) {
            element.addEventListener('click', function() {
                element.classList.toggle('dropdown-toggle-open');
            });
        });
    }

    function selectTextCopyToClipboard() {
        var elements = document.querySelectorAll('input[type="text"]');

        Array.prototype.forEach.call(elements, function(element) {
            element.addEventListener('focus', function(event) {
                event.preventDefault();
                this.select();

                var clipboardInputs = new ClipboardJS(this, {
                    target: function(trigger) {
                        return trigger;
                    }
                });

                clipboardInputs.on('success', function(ev) {
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

            element.addEventListener('blur', function(event) {
                var helpBlock = {};
                var parentNextSibling = this.parentElement.nextElementSibling;

                if (parentNextSibling &&
                    parentNextSibling.nodeName.toLowerCase() === 'span') {
                    helpBlock = parentNextSibling;
                } else {
                    helpBlock = this.nextElementSibling;
                }

                event.preventDefault();
                helpBlock.innerHTML = 'Click to copy';
            }, true);
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

    loadTwitterScript();
    toggleInputCaret();
    selectTextCopyToClipboard();
})();
