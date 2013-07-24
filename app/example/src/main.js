/*global require*/
'use strict';

// Require.js allows us to configure shortcut alias
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bbsm: {
            deps: [
                'backbone'
            ]
        }
    },
    paths: {
        jquery: '../../components/jquery/jquery',
        underscore: '../../components/underscore/underscore',
        backbone: '../../components/backbone/backbone',
        bbsm: '../../src/bbsm',
        text: '../../components/requirejs-text/text',
        elevator: 'views/elevator'
    }
});

require([
    'elevator'
], function (Elevator) {

    new Elevator({
        initialState: "lobby",
        states: {
            lobby: {

            }
        }
    }).render();
});
