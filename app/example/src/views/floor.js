define([
    'backbone',
    'text!../templates/floor.html'
], function(Backbone, floorTemplate) {
    var UP_PRESSED = "upPressed",
        DOWN_PRESSED = "downPressed",
        BUTTONS_PRESSED = "buttonsPressed",
        Floor = Backbone.View.extend({
        initialize: initialize,
        render: render,
        upPressed: upPressed,
        downPressed: downPressed,
        template: _.template(floorTemplate),
        events: {
            "click .upButton": UP_PRESSED,
            "click .downButton": DOWN_PRESSED
        },
        model: Backbone.Model
    });

    Floor.prototype.masks =  {
        UP_MASK: 2,
        DOWN_MASK: 1
    };

    function initialize() {
        this.floor = this.options.floor;
        this.buttons = this.options.buttons;
        this.model = new this.model({
            buttonsPressed: 0
        });
    }

    function render() {
        this.$el.html(this.template({
            floor: this.floor,
            buttons: this.buttons,
            masks: this.masks
        }));
    }

    function upPressed() {
        _buttonPressed.call(this, this.masks.UP_MASK);
    }

    function downPressed() {
        _buttonPressed.call(this, this.masks.DOWN_MASK);
    }

    // Private methods. These must be supplied with a context.
    function _buttonPressed(mask) {
        this.model.set(BUTTONS_PRESSED, this.model.get(BUTTONS_PRESSED) | mask);
    }

    return Floor;
});