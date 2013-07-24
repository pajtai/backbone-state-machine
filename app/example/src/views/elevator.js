define([
    'bbsm',
    'text!../templates/elevator.html'
], function (BBSM, elevatorTemplate) {

    var Elevator = BBSM.extend({
        el: "#elevator",
        template: _.template(elevatorTemplate),
        render: function() {
            var html = this.template({currentState: "test"});
            this.$el.html(html);
        }
    });

    console.log("return");
    return Elevator;
});