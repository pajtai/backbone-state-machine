(function() {
        // Set common strings as variables for IDE code completion
    var STATES = "states",
        CURRENT_STATE = "currentState",
        ON_ENTER = "onEnter",
        TRANSITIONING = "transitioning",

        StateView = Backbone.View.extend({

            initialize: initialize,
            getStates: getStates,
            getState: getState,
            transition: transition
        });

    function initialize() {
        var states = this.options.states,
            listeners = ["onEnter"];
        this.stateModel = new Backbone.Model();
        this.stateModel.set(STATES, _.keys(states));
        this.states = this.options.states;
        this.listenTo(this.stateModel, "change:currentState", currentStateChanged.bind(this));
        setupListeners.call(this, listeners);
        if (this.options.initialState) {
            this.transition(this.options.initialState);
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
            transitionTo.apply(this, arguments);
        }
    }

    // Private methods -------------------------------------------------------------------------------------------------
    function setupListeners(listeners) {
        var self = this;
        _.forEach(listeners, function(oneListener) {
            _.forEach(self.options.eventListeners[oneListener], function(listener) {
                self.listenTo(self, oneListener, listener.bind(self));
            });
        });
    }

    function currentStateChanged() {
        this.trigger("transition");
    }

    // onEnter:transitioning
    // onExit:OLD_STATE
    // onEnter:NEW_STATE
    // onExit:transitioning
    function transitionTo(newState) {
        this.trigger(ON_ENTER, TRANSITIONING);
        this.stateModel.set(CURRENT_STATE, newState);
    }

    window.StateView = StateView;
}());
