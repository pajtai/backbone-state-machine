define([
    'bbsm',
    'text!../templates/elevator.html'
], function (BBSM, elevatorTemplate) {

    var Elevator = BBSM.extend({
        el: "#elevator",
        template: _.template(elevatorTemplate),
        // Variables to be defined later. Listed for easy reference.
        buttonPressedCollection: undefined,
        //
        initialize: initialize,
        setupEventListeners: setupEventListeners,
        render: render,
        beginPickingPeopleUp: beginPickingPeopleUp,
        getNextKeyPress: getNextKeyPress
    });

    function initialize() {
        // Call the initialize method of BBSM to set things up correctly
        Elevator.__super__.initialize.apply(this, arguments);
        this.buttonPressedCollection = this.options.buttonPressedCollection;
        this.setupEventListeners();
    }

    function setupEventListeners() {
        this.listenTo(this.buttonPressedCollection, "add", this.beginPickingPeopleUp);
    }

    function render() {
        var html = this.template({currentState: this.getState()});
        this.$el.html(html);
    }

    function beginPickingPeopleUp() {
        console.log("begin picking people up");
    }

    function getNextKeyPress() {

    }

    return Elevator;
});