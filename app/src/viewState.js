/*global require:false */
(function() {
    "use strict";
        // Set common strings as variables for IDE code completion
    var STATES = "states",
        CURRENT_STATE = "currentState",
        ON_BEGIN = "onBegin",
        ON_ENTER = "onEnter",
        ON_EXIT = "onExit",
        ON_FINISH = "onFinish",
        TRANSITIONING = "transitioning",
        BBSM = Backbone.View.extend({

            stateModel: undefined,
            states: undefined,

            initialize: initialize,
            getStates: getStates,
            getState: getState,
            transition: transition
        });

    function initialize() {
        var states = this.options.states,
            listeners = [ON_BEGIN, ON_ENTER, ON_EXIT, ON_FINISH];
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
        // args for old state, new state
        this.trigger("transition");
    }

    // onBegin:transitioning
    // onExit:OLD_STATE
    // onEnter:NEW_STATE
    // onFinish:transitioning
    function transitionTo(newState) {
        this.trigger(ON_BEGIN, TRANSITIONING);
        this.stateModel.set(CURRENT_STATE, newState);
        this.trigger(ON_FINISH, TRANSITIONING);
    }

    window.BBSM = BBSM;
}());
