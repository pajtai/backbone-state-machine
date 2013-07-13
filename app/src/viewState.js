/*global require:false */
if (typeof require !== 'undefined') {
    var _ = require("Backbone/node_modules/underscore"),
        Backbone = require("Backbone");
}

(function(root) {
    "use strict";
        // Set common strings as variables for IDE code completion
    var STATES = "states",
        CURRENT_STATE = "currentState",
        ON_ENTER = "onEnter",
        ON_EXIT = "onExit",
        TRANSITIONING = "transitioning",
        Backbone = (function() {
            if (root && root.Backbone) {
                return root.Backbone;
            }
            if (typeof require !== 'undefined') {
                return require('Backbone');
            }
        }()),
        StateView = Backbone.View.extend({

            initialize: initialize,
            getStates: getStates,
            getState: getState,
            transition: transition
        });

    function initialize() {
        var states = this.options.states,
            listeners = [ON_ENTER, ON_EXIT];
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
        this.trigger(ON_EXIT, TRANSITIONING);
    }

    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        // Expose StateView as module.exports in loaders that implement the Node
        // module pattern (including browserify). Do not create the global, since
        // the user will be storing it themselves locally, and globals are frowned
        // upon in the Node module world.
        module.exports = StateView;
    } else {
        // Register as a named AMD module, since StateView can be concatenated with other
        // files that may use define, but not via a proper concatenation script that
        // understands anonymous AMD modules. A named AMD is safest and most robust
        // way to register. Lowercase StateView is used because AMD module names are
        // derived from file names, and StateView is normally delivered in a lowercase
        // file name. Do this after creating the global so that if an AMD module wants
        // to call noConflict to hide this version of StateView, it will work.
        if ( typeof define === "function" && define.amd ) {
            define( "StateView", ["underscore", "backbone" ], function (_, Backbone) { return StateView; } );
        }
    }

// If there is a window object, that at least has a document property,
// define StateView
    if ( typeof window === "object" && typeof window.document === "object" ) {
        window.StateView = StateView;
    }
}(this));
