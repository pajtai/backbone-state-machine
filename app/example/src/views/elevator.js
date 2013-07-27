define([
    'bbsm',
    'text!../templates/elevator.html'
], function (BBSM, elevatorTemplate) {

    var WAITING_WITH_DOORS_OPEN = "waitingWithDoorsOpen",
        DOORS_CLOSING = "doorsClosing",
        DOORS_OPENING = "doorsOpening",
        MOVING_UP = "movingUp",
        MOVING_DOWN = "movingDown",
        Elevator = BBSM.extend({
        el: "#elevator",
        template: _.template(elevatorTemplate),
        // Variables to be defined later. Listed for easy reference.
        buttonPressedCollection: undefined,
        //
        initialize: initialize,
        setupEventListeners: setupEventListeners,
        render: render,
        getNextKeyPress: getNextKeyPress,
        initialState: "waitingWithDoorsOpen",
        states: {
            waitingWithDoorsOpen: {
                beginPickingPeopleUp: function() {
                    console.log("!!!!");
                    //this.beginPickingPeopleUp();
                },
                allowedTransitions: [
                    DOORS_CLOSING
                ]
            },
            doorsClosing: {
                allowedTransitions: [
                    DOORS_OPENING, MOVING_UP, MOVING_DOWN
                ]
            },
            doorsOpening: {
                allowedTransitions: [
                    WAITING_WITH_DOORS_OPEN
                ]
            },
            movingUp: {
                allowedTransitions: [
                    DOORS_OPENING
                ]
            },
            movingDown: {
                allowedTransitions: [
                    DOORS_OPENING
                ]
            }
        }
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

    function getNextKeyPress() {

    }

    return Elevator;
});