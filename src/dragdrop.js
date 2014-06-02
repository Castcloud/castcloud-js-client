"use strict";

var container;
var child;
var dragging;
var moving;
var el;
var offsetX;
var offsetY;
var y;
var h;
var prevY;
var endCallbacks = [];

function find(y) {
	var result;
	$(child + ":not(.dragging)").each(function(index, element) {
		if (Math.abs($(element).offset().top + h - y) < h) {
			result = $(element);
		}
	});
	return result;
}

module.exports = {
	init: function(_container, _child) {
		container = _container;
		child = _child;

		$(container).on("mousedown", child, function(e) {
			e.stopPropagation();
			dragging = $(this);
			h = dragging.outerHeight() / 2;

			y = e.pageY;
			prevY = y;
			offsetX = e.pageX - dragging.offset().left;
			offsetY = e.pageY - dragging.offset().top;
		});

		$(document).mousemove(function(e) {
			if (e.pageY !== y) {
				if (dragging && !moving) {
					if (dragging.hasClass("label")) {
						dragging.find(".content").hide();
					}
					moving = true;
					var width = dragging.width();
					var height = dragging.outerHeight();
					dragging.replaceWith('<div class="dragging-placeholder"></div>');
					$(".dragging-placeholder").height(height);
					dragging.addClass("dragging").width(width);
					dragging.css("left", dragging.offset().left);
					dragging.css("top", dragging.offset().top);
					dragging.detach().appendTo("body");
				}
				if (dragging) {
					dragging.css("left", "50px");
					dragging.css("top", e.pageY - offsetY);

					var height = dragging.outerHeight();

					el = find(e.pageY - offsetY + h);
					if (el !== undefined) {
						$(".dragging-placeholder").remove();
						if (prevY < e.pageY) {
							if (el.hasClass("label")) {
								el.find(".content").prepend($('<div class="dragging-placeholder"></div>'));
							}
							else {
								$('<div class="dragging-placeholder"></div>').insertAfter(el);	
							}							
						}
						else {
							$('<div class="dragging-placeholder"></div>').insertBefore(el);
						}
						$(".dragging-placeholder").height(height);
					}
					prevY = e.pageY;
				}
			}			
		});

		$(document).mouseup(function(e) {
			if (dragging) {
				if (moving) {
					dragging.css("left", "auto");
					dragging.css("top", "auto");

					dragging.removeClass("dragging");
					$(".dragging-placeholder").replaceWith(dragging);
					moving = false;
					endCallbacks.forEach(function(cb) { cb(); });
				}
				dragging = null;
			}			
		});
	},

	ended: function(cb) {
		endCallbacks.push(cb);
	}
};