define([
    'backbone',
    'text!../templates/floor.html'
], function(Backbone, floorTemplate) {
    var Floor = Backbone.View.extend({
        initialize: initialize,
        render: render,
        template: _.template(floorTemplate),
    });

    Floor.prototype.masks =  {
        UP_MASK: 2,
        DOWN_MASK: 1
    };

    function initialize() {
        this.floor = this.options.floor;
        this.buttons = this.options.buttons;
    }

    function render() {
        this.$el.html(this.template({
            floor: this.floor,
            buttons: this.buttons,
            masks: this.masks
        }));
    }

    return Floor;
});