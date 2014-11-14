var IScrollMixin = {
	componentDidMount: function() {
        this.scroller = new IScroll(this.getDOMNode(), {
            mouseWheel: true,
            scrollbars: 'custom',
            keyBindings: true,
            interactiveScrollbars: true,
            click: true
        });
    },

    componentDidUpdate: function() {
        if (this.scroller) {
            this.scroller.refresh();
        }
    }
};

module.exports = IScrollMixin;