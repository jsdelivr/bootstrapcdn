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

    toggleInputCaret();
    selectTextCopyToClipboard();
})();
