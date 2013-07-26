define([
    'backbone',
    'floor'
],function(Backbone, Floor) {

    var UP = Floor.prototype.masks.UP_MASK,
        DOWN = Floor.prototype.masks.DOWN_MASK,
        BUTTON_QUEUE = "buttonQueue",
        Building = Backbone.View.extend({
            el: "#floors",
            numberOfFloors: undefined,
            elevator: undefined,
            initialize: initialize,
            render: render,
            installElevator: installElevator,
            updateButtonPressedQueue: updateButtonPressedQueue,
            model: Backbone.Model
    });

    function initialize() {
        this.numberOfFloors = this.options.numberOfFloors;
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
            this.listenTo(floor.model, "change:buttonsPressed", this.updateButtonPressedQueue.bind({
                self: this,
                floor: i
            }));
        }
    }

    // When called this method has a context bound that includes the floor and instance
    function updateButtonPressedQueue() {
        var buttonMask = arguments[1],
            self = this.self;

        self.elevator.pressedButtonQueue.push(
            {
                floor: this.floor,
                buttonsPressed: buttonMask
            }
        );
        console.log(self.elevator.pressedButtonQueue);
    }

    function installElevator(elevator) {
        this.elevator = elevator;

    }

    return Building;
});