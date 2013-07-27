/*global require:false */
(function() {
    "use strict";
        // Set common strings as variables for IDE code completion
    var STATES = "states",
        ALLOWED_TRANSITIONS = "allowedTransitions",
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
        BBSM,
        _,
        Backbone;
        // RequireJS support
        if ( FUNCTION === typeof define && define.amd && FUNCTION === typeof require) {
            _ = require("underscore");
            Backbone = require("backbone");
        } else {
            // or grab from the global scope
            _ = window._;
            Backbone = window.Backbone;
        }
        BBSM = Backbone.View.extend({

            stateModel: undefined,
            states: undefined,

            initialize: initialize,
            start: start,
            transition: transition,
            getState: getCurrentState,
            getStates: getStates,
            getAllowedTransitions: getAllowedTransitions
        });

    // TODO: write test for instantStart
    function initialize() {
        var states = this.states;
        this.stateModel = new Backbone.Model();
        this.stateModel.set(STATES, _.keys(states));
        // TODO: test instantStart
        if (this.options.instantStart) {
            this.start();
        }
        _setupAvailableMethods.call(this);
        _setupMethods.call(this);

    }

    // There is a separate start methods, so that listeners that are attached to the
    // returned instance of a new BBSM are able to listen to all events
    function start() {
        var listeners = _.keys(this.eventListeners || {});
        this.start = undefined;
        this.listenTo(this.stateModel, "change:" + CURRENT_STATE, _currentStateChanged.bind(this));
        _setupListeners.call(this, listeners);
        // TODO: put this in a .startMachine or some such
        if (this.initialState) {
            this.transition(this.initialState);
        }
        return this;
    }

    function transition(newState) {
        var currentState = this.stateModel.get(CURRENT_STATE);
        if (!currentState || _.contains(this.states[currentState].allowedTransitions, newState)) {
            _transitionTo.call(this, {
                current: currentState,
                next: newState
            });
        } else {
            _failTransition.call(this, newState);
        }
        return this;
    }

    function getCurrentState() {
        return this.stateModel.get(CURRENT_STATE);
    }

    function getStates() {
        return this.stateModel.get(STATES);
    }

    function getAllowedTransitions(state) {
        return this.states[state].allowedTransitions;
    }

    // +---------------------------------------------------------------------------------------------------------------+
    // ++-------------------------------------------------------------------------------------------------------------++
    // ||  Private methods: since these are local, these must be called with "apply" or "call" to attach the context  ||
    // ++-------------------------------------------------------------------------------------------------------------++
    // +---------------------------------------------------------------------------------------------------------------+
    function _setupListeners(listeners) {
        var self = this;
        _.forEach(listeners, function(oneListener) {
            _.forEach(self.options.eventListeners[oneListener], function(listener) {
                self.listenTo(self, oneListener, listener.bind(self));
            });
        });
        this.listenTo(this, ON_ENTER, _callOnEnterOfState);
        this.listenTo(this, ON_EXIT, _callOnExitOfState);
    }

    function _currentStateChanged(model, currentState) {
        // args for old state, new state
        this.trigger(TRANSITION, {
            previous: model.previous(CURRENT_STATE),
            current: currentState});
    }

    function _transitionTo(states) {
        this.trigger(ON_BEGIN, TRANSITIONING);
        this.trigger(ON_EXIT, states.current);
        _detachStateMethods.call(this, states.current);
        _attachStateMethods.call(this, states.next);
        this.stateModel.set(CURRENT_STATE, states.next);
        this.trigger(ON_ENTER, states.next);
        this.trigger(ON_FINISH, TRANSITIONING);
    }

    function _failTransition(failedState) {
        this.trigger(ON_TRANSITION_NOT_HANDLED, failedState);
    }

    // Remove methods available in 'state' and replace them with noops
    function _detachStateMethods(state) {
        var stateMethods,
            states = this.states[state],
            self = this;
        if (!states) {
            return;
        }
        stateMethods = states.availableMethods;
        _.forEach(stateMethods, function(oneStateMethod) {
            if (typeof states[oneStateMethod] === FUNCTION) {
                self[oneStateMethod]  = (function(oneStateMethod) {
                    var noopMethod = function() {
                        if (noopMethod === self[oneStateMethod]) {
                            console.log(oneStateMethod + " not handled");
                            self.trigger(ON_METHOD_NOT_HANDLED, oneStateMethod);
                        } else {
                            self[oneStateMethod].apply(self, arguments);
                        }

                    };
                    return noopMethod;
                }(oneStateMethod));
            }
        });
    }

    // Attach method available in 'state'
    function _attachStateMethods(state) {
        var stateMethods,
            states = this.states[state],
            self = this;
        if (!states) {
            return;
        }
        stateMethods = states.availableMethods;
        _.forEach(stateMethods, function(oneStateMethod) {
            if (typeof states[oneStateMethod] === FUNCTION) {
                self[oneStateMethod] = states[oneStateMethod];
            }
        });
    }

    function _callOnEnterOfState() {
        // We do not want to trigger a methodNotHandled event if there is no onEnter
        var state = this.getState(),
            onEnter = state ? this.states[state].onEnter : false;
        if (onEnter) {
            onEnter();
        }
    }

    function _callOnExitOfState() {
        // We do not want to trigger a methodNotHandled event if there is no onExit
        var state = this.getState(),
            onExit = state ? this.states[this.getState()].onExit : false;
        if (onExit) {
            onExit();
        }
    }

    function _setupMethods() {
        var self = this;
        _.forEach(_.keys(this.states), function(oneState) {
            _detachStateMethods.call(self, oneState);
        });
    }

    function _setupAvailableMethods() {
        var self = this;
        _.forEach(_.keys(this.states), function(stateName) {
            self.states[stateName].availableMethods =
                _.without(_.keys(self.states[stateName]),
                    ON_ENTER, ON_EXIT, ALLOWED_TRANSITIONS);
        });
    }

    if ( FUNCTION === typeof define && define.amd ) {

        define( "bbsm", ['underscore', 'backbone'], function () { return BBSM; } );
    }
    //TODO: add AMD support
    window.BBSM = BBSM;
}());
