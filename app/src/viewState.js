/*global require:false */
(function() {
    "use strict";
        // Set common strings as variables for IDE code completion
    var STATES = "states",
        CURRENT_STATE = "currentState",
        FUNCTION = "function",
        ON_BEGIN = "onBegin",
        ON_ENTER = "onEnter",
        ON_EXIT = "onExit",
        ON_FINISH = "onFinish",
        ON_METHOD_NOT_HANDLED = "onMethodNotHandled",
        ON_TRANSITION_NOT_HANDLED = "onTransitionNotHandled",
        TRANSITIONING = "transitioning",
        TRANSITION = "transition",
        BBSM = Backbone.View.extend({

            stateModel: undefined,
            states: undefined,

            initialize: initialize,
            getStates: getStates,
            getState: getState,
            transition: transition,
            getAllowedTransitions: getAllowedTransitions
        });

    function initialize() {
        var states = this.options.states,
            listeners = [ON_BEGIN, ON_ENTER, ON_EXIT, ON_FINISH, ON_TRANSITION_NOT_HANDLED,
                ON_METHOD_NOT_HANDLED];
        this.stateModel = new Backbone.Model();
        this.stateModel.set(STATES, _.keys(states));
        this.states = this.options.states;
        this.listenTo(this.stateModel, "change:" + CURRENT_STATE, currentStateChanged.bind(this));
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
        var currentState = this.stateModel.get(CURRENT_STATE);
        if (!currentState || _.contains(this.states[currentState].allowedTransitions, newState)) {
            transitionTo.call(this, {
                current: currentState,
                next: newState
            });
        } else {
            failTransition.call(this, newState);
        }
    }

    function getAllowedTransitions(state) {
        return this.states[state].allowedTransitions;
    };

    // Private methods -------------------------------------------------------------------------------------------------
    function setupListeners(listeners) {
        var self = this;
        _.forEach(listeners, function(oneListener) {
            _.forEach(self.options.eventListeners[oneListener], function(listener) {
                self.listenTo(self, oneListener, listener.bind(self));
            });
        });
        this.listenTo(this, ON_ENTER, callOnEnterOfState);
        this.listenTo(this, ON_EXIT, callOnExitOfState);
    }

    function currentStateChanged(model, currentState) {
        // args for old state, new state
        this.trigger(TRANSITION, {
            previous: model.previous(CURRENT_STATE),
            current: currentState});
    }

    function transitionTo(states) {
        this.trigger(ON_BEGIN, TRANSITIONING);
        this.trigger(ON_EXIT, states.current);
        detachStateMethods.call(this, states.current);
        attachStateMethods.call(this, states.next);
        this.stateModel.set(CURRENT_STATE, states.next);
        this.trigger(ON_ENTER, states.next);
        this.trigger(ON_FINISH, TRANSITIONING);
    }

    function failTransition(failedState) {
        this.trigger(ON_TRANSITION_NOT_HANDLED, failedState);
    }

    // Remove methods available in 'state' and replace them with noops
    function detachStateMethods(state) {

    }

    // Attach method available in 'state'
    function attachStateMethods(state) {
        var states = this.states[state];
        _.forEach(_.keys(states), function(stateMethod) {
            if (typeof states[stateMethod] === FUNCTION) {
                this[stateMethod] = states[stateMethod];
            }
        }.bind(this));
    }

    function callOnEnterOfState() {
        if (this.onEnter) {
            this.onEnter();
        }
    }

    function callOnExitOfState() {
        if (this.onExit) {
            this.onExit();
        }
    }

    //TODO: add AMD support
    window.BBSM = BBSM;
}());
