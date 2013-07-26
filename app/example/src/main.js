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
        elevator: 'views/elevator',
        floor: 'views/floor',
        building: 'views/building'
    }
});

require([
    'elevator',
    'building'
], function (Elevator, Building) {

    var WAITING_WITH_DOORS_OPEN = "waitingWithDoorsOpen",
        DOORS_CLOSING = "doorsClosing",
        DOORS_OPENING = "doorsOpening",
        MOVING_UP = "movingUp",
        MOVING_DOWN = "movingDown",
        building,
        elevator = new Elevator({
        initialState: "waitingWithDoorsOpen",
        states: {
            waitingWithDoorsOpen: {
                allowedTransitions: [
                    DOORS_CLOSING
                ]
            },
            doorsClosing: {
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
                allowedTransitions: [
                    DOORS_OPENING
                ]
            },
            movingDown: {
                allowedTransitions: [
                    DOORS_OPENING
                ]
            }
        }
    });

    elevator.start().render();

    building = new Building({
        numberOfFloors: 5
    });

    building.installElevator(elevator);
    building.render();
});
