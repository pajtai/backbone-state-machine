define([
    'bbsm',
    'text!../templates/elevator.html'
], function (BBSM, elevatorTemplate) {

    // Elevator states
    // Doors open
    // Doors closing
    // Doors opening
    // Doors closed - Moving up
    // Doors closed - Moving down

    var CURRENT_FLOOR = "currentFloor",
        CURRENT_PICKUP = "currentPickup",
        CURRENT_STATE = "currentState",
        DOORS_OPEN = "doorsOpen",
        DOORS_CLOSED = "doorsClosed",
        DOORS_CLOSING = "doorsClosing",
        DOORS_OPENING = "doorsOpening",
        FLOOR = "floor",
        MOVING_UP = "movingUp",
        MOVING_DOWN = "movingDown",
        ELEVATOR_SPEED_MS_FLOOR = 1000,
        Elevator = BBSM.extend({
        el: "#elevator",
        template: _.template(elevatorTemplate),
        // Variables to be defined later. Listed for easy reference.
        buttonPressedCollection: undefined,
        floors: [],
        //
        initialize: initialize,
        setupEventListeners: setupEventListeners,
        render: render,
        getNextKeyPress: getNextKeyPress,
        setFloorHeight: setFloorHeight,
        initialState: "doorsOpen",
            elevatorFloorChanged:elevatorFloorChanged,
        states: {
            doorsOpen: {
                onEnter: setToGroundFloor,
                beginPickingPeopleUp: beginPickingPeopleUp,
                goToPickupFloor: goToPickupFloor,
                getNextKeyPress: getNextKeyPress,
                allowedTransitions: [
                    DOORS_CLOSING
                ]
            },
            doorsClosing: {
                onEnter: closeDoors,
                allowedTransitions: [
                    DOORS_OPENING, DOORS_CLOSED
                ]
            },
            doorsOpening: {
                onEnter: openDoors,
                allowedTransitions: [
                    DOORS_OPEN
                ]
            },
            doorsClosed: {
                onEnter: beginMoving,
                allowedTransitions: [
                    MOVING_UP, MOVING_DOWN
                ]
            },
            movingUp: {
                moveToFloor: moveToFloor,
                allowedTransitions: [
                    DOORS_OPENING
                ]
            },
            movingDown: {
                moveToFloor: moveToFloor,
                allowedTransitions: [
                    DOORS_OPENING
                ]
            }
        }
    });

    function initialize() {
        // Call the initialize method of BBSM to set things up correctly
        Elevator.__super__.initialize.apply(this, arguments);
        this.model = new Backbone.Model();
        this.buttonPressedCollection = this.options.buttonPressedCollection;
        this.setupEventListeners();
    }

    function setupEventListeners() {
        this.listenTo(this.buttonPressedCollection, "add", this.beginPickingPeopleUp);
        this.listenTo(this.model, "change:" + CURRENT_PICKUP, this.goToPickupFloor);
        this.listenTo(this.model, "change:" + CURRENT_FLOOR, this.render);
        this.listenTo(this.stateModel, "change:" + CURRENT_STATE, this.render);
        this.listenTo(this.model, "change:" + CURRENT_FLOOR, this.elevatorFloorChanged);
    }

    function render() {
        var html = this.template({
            currentState: this.getState(),
            currentFloor: this.model.get(CURRENT_FLOOR)
        });

        this.$el.html(html);
    }

    function getNextKeyPress() {
        var buttonPressed = this.buttonPressedCollection.shift();
        this.model.set(CURRENT_PICKUP, buttonPressed.get(FLOOR));
    }

    function beginPickingPeopleUp() {
        this.getNextKeyPress();
    }

    function goToPickupFloor(model, floor) {
        this.transition(DOORS_CLOSING);
    }

    function setToGroundFloor() {
        this.model.set(CURRENT_FLOOR, 1);
    }

    function beginMoving() {
        var moveTo = this.model.get(CURRENT_PICKUP),
            transitionTo = this.model.get(CURRENT_FLOOR) > this.model.get(moveTo) ? MOVING_DOWN : MOVING_UP;
        this.transition(transitionTo);
        this.moveToFloor(moveTo);
    }

    function moveToFloor(moveTo) {
        this.model.set(CURRENT_FLOOR, moveTo);
    }

    function setFloorHeight(floor, height) {
        this.floors[floor] = height;
    }


    function elevatorFloorChanged(model, floor) {
        this.$el.animate({
                top: this.floors[floor]
            },
            Math.abs(model.previous(CURRENT_FLOOR) - floor) * ELEVATOR_SPEED_MS_FLOOR,
            "swing",
            function() {
                this.transition(DOORS_OPENING)
            }.bind(this));
    }

    function openDoors() {
        this.transition(DOORS_OPEN);
    }

    function closeDoors() {
        this.transition(DOORS_CLOSED);
    }

    return Elevator;
});