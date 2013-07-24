define([
    'bbsm',
    'text!../templates/elevator.html'
], function (BBSM, elevatorTemplate) {

    var Elevator = BBSM.extend({
        el: "#elevator",
        template: _.template(elevatorTemplate),
        render: function() {
            var html = this.template({currentState: this.getState()});
            this.$el.html(html);
        }
    });

    return Elevator;
});