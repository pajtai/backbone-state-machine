(function() {
        // Set common strings as variables for IDE code completion
    var STATES = "states",
        CURRENT_STATE = "currentState",

        StateView = Backbone.View.extend({

            initialize: initialize,
            getStates: getStates,
            getState: getState,
            transition: transition
        });

    function initialize() {
        var states = this.options.states;
        this.stateModel = new Backbone.Model();
        this.stateModel.set(STATES, _.keys(states));
        this.states = this.options.states;
        if (this.options.initialState) {
            this.transition(this.options.initialState);
        }
        this.listenTo(this.stateModel, "change:currentState", currentStateChanged);

        // Private helper functions
        function currentStateChanged() {
            this.trigger("transition");
        }
    };

    function getStates() {
        return this.stateModel.get(STATES);
    }



    function getState() {
        return this.stateModel.get(CURRENT_STATE);
    }

    function transition(newState) {
        var state = this.stateModel.get(CURRENT_STATE);
        if (!state || _.contains(this.states[state].allowedTransitions, newState)) {
            this.stateModel.set(CURRENT_STATE, newState);
        }
    }

    window.StateView = StateView;
}());