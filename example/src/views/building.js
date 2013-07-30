define([
    'backbone',
    'floor'
],function(Backbone, Floor) {

    var UP = Floor.prototype.masks.UP_MASK,
        DOWN = Floor.prototype.masks.DOWN_MASK,
        BUTTON_QUEUE = "buttonQueue",
        BUTTON_PRESSED = "buttonPressed",
        CURRENT_FLOOR = "currentFloor",
        Building = Backbone.View.extend({
            el: "#floors",
            model: Backbone.Model,
            // Variables we will define later. Listed for easy reference.
            numberOfFloors: undefined,
            elevator: undefined,
            buttonPressedCollection: undefined,
            floors: [],
            //
            initialize: initialize,
            render: render,
            updateButtonPressedQueue: updateButtonPressedQueue,
            installElevator: installElevator
    });

    function initialize() {
        this.numberOfFloors = this.options.numberOfFloors;
        this.elevator = this.options.elevator;
        this.buttonPressedCollection = this.options.buttonPressedCollection;
        this.model = new this.model({
            buttonQueue: []
        });
    }

    function render() {
        var i,
            floor,
            id,
            remove;

        for (i=this.numberOfFloors; i>0; --i) {
            id = "floor" + i;
            remove = i === this.numberOfFloors ?
                UP :
                i === 1 ?
                    DOWN : 0;
            //TODO: use more templating / context injection to build this all up before appending
            this.$el.append($("<div/>").attr("id", id));
            floor = new Floor({
                floor: i,
                buttons: (UP | DOWN) ^ remove,
                el: "#" + id
            });
            floor.render();
            // We store which floor the buttons are on using binding
            this.listenTo(floor.model, "change:" + BUTTON_PRESSED, this.updateButtonPressedQueue.bind({
                self: this,
                floor: i
            }));
            this.floors[i] = floor;
        }
    }

    // When called this method has a context bound that includes the floor and instance
    function updateButtonPressedQueue(model, buttonMask) {
        var self = this.self,
            previousButtonMask = model.previous(BUTTON_PRESSED);

        self.buttonPressedCollection.add(
            {
                floor: this.floor,
                // Check what changed to determine the button that was pressed
                buttonPressed: buttonMask ^ previousButtonMask
            }
        );
    }

    function installElevator() {
        var i;

        $("#elevator-shaft").height($("#floors").height());
        for (i=this.numberOfFloors; i>0; --i) {
            this.elevator.setFloorHeight(i, this.floors[i].$el.position().top);
        }
    }

    return Building;
});