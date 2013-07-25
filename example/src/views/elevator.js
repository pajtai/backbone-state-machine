define([
    'bbsm',
    'text!../templates/elevator.html'
], function (BBSM, elevatorTemplate) {

    var Elevator = BBSM.extend({
        el: "#elevator",
        template: _.template(elevatorTemplate),
        render: render
    });

    function render() {
        var html = this.template({currentState: this.getState()});
        this.$el.html(html);
    }

    return Elevator;
});