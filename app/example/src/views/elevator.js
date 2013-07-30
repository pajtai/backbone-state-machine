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

    var BUTTON_PRESSED = "buttonPressed",
        CURRENT_FLOOR = "currentFloor",
        CURRENT_PICKUP = "currentPickup",
        CURRENT_STATE = "currentState",
        WAITING_WITH_DOORS_OPEN = "waitingWithDoorsOpen",
        BUSY_WITH_DOORS_OPEN = "busyWithDoorsOpen",
        DOORS_CLOSING = "doorsClosing",
        DOORS_OPENING = "doorsOpening",
        FLOOR = "floor",
        MOVING_UP = "movingUp",
        MOVING_DOWN = "movingDown",
        UP_MASK = 2,
        DOWN_MASK = 1,
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
        initialState: "waitingWithDoorsOpen",
            elevatorFloorChanged:elevatorFloorChanged,
        states: {
            waitingWithDoorsOpen: {
                onEnter: setToGroundFloor,
                beginPickingPeopleUp: beginPickingPeopleUp,
                allowedTransitions: [
                    BUSY_WITH_DOORS_OPEN
                ]
            },
            busyWithDoorsOpen: {
                goToPickupFloor: goToPickupFloor,
                getNextKeyPress: getNextKeyPress,
                allowedTransitions: [
                    DOORS_CLOSING
                ]
            },
            doorsClosing: {
                beginMoving: beginMoving,
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
        this.transition(BUSY_WITH_DOORS_OPEN);
        this.getNextKeyPress();
    }

    function goToPickupFloor(model, floor) {
        this.transition(DOORS_CLOSING);
        this.beginMoving();
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

    return Elevator;
});