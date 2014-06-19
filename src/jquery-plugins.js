"use strict";

$.fn.keybindInput = function(child) {
    this.on("keydown", child, function(e) {
        e.preventDefault();
        e.stopPropagation();
        var s = "";
        if (e.ctrlKey) {
            s += "ctrl+";
        }
        if (e.shiftKey) {
            s += "shift+";
        }
        if (e.altKey) {
            s += "alt+";
        }
        if (e.metaKey) {
            s += "meta+";
        }

        var special = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'ins',
            46: 'del'
        };

        var character = 
            (e.which > 47 && e.which < 58)   ||
            (e.which > 64 && e.which < 91)   ||
            (e.which > 95 && e.which < 112)  ||
            (e.which > 185 && e.which < 193) ||
            (e.which > 218 && e.which < 223);

        if (character) {
            var k = String.fromCharCode(e.which).toLowerCase();
            s += k;
        }
        else if (e.which in special) {
            var k = special[e.which];
            s += k;
        }
        
        if (character || e.which in special) {
            $(this).val(s);
        }
        return false;
    });
}

$.fn.isOverflowing = function() {
    var el = this.get(0);
    var overflowing = false;
    if (el.clientHeight < el.scrollHeight) {
        overflowing = true;
    }
    return overflowing;
}

$.fn.id = function() {
    return this.prop("id").split("-")[1];
}