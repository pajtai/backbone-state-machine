define([
    'bbsm',
    'text!../templates/elevator.html'
], function (BBSM, elevatorTemplate) {

    var Elevator = BBSM.extend({
        el: "#elevator",
        template: _.template(elevatorTemplate),
        render: render,
        getNextKeyPres: getNextKeyPress,
        // TODO: would this be better as a model?
        pressedButtonQueue: []
    });

    function render() {
        var html = this.template({currentState: this.getState()});
        this.$el.html(html);
    }

    function getNextKeyPress() {
        if (this.pressedButtonQueue.length) {
            return this.pressedButtonQueue.shift();
        }
    }

    return Elevator;
});