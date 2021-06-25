/* global ClipboardJS:false */

(function() {
    'use strict';

    function toggleInputCaret() {
        var elements = document.querySelectorAll('.content-card-block .dropdown-toggle');

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
                    var parentNextSibling = ev.trigger.parentElement.nextElementSibling;
                    var helpBlock = parentNextSibling && parentNextSibling.nodeName.toLowerCase() === 'span' ?
                        parentNextSibling :
                        ev.trigger.nextElementSibling;

                    helpBlock.textContent = 'Copied text to clipboard';
                    helpBlock.classList.add('copy-btn-active');
                });
            }, true);

            element.addEventListener('blur', function(event) {
                var parentNextSibling = this.parentElement.nextElementSibling;
                var helpBlock = parentNextSibling && parentNextSibling.nodeName.toLowerCase() === 'span' ?
                    parentNextSibling :
                    this.nextElementSibling;

                event.preventDefault();
                helpBlock.textContent = 'Click to copy';
                helpBlock.classList.remove('copy-btn-active');
            }, true);
        });
    }

    toggleInputCaret();
    selectTextCopyToClipboard();
})();
