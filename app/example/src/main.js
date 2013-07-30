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
        building: 'views/building',
        buttonPressedCollection: 'models/buttonPressedCollection'
    }
});

require([
    'elevator',
    'building',
    'buttonPressedCollection'
], function (Elevator, Building, ButtonPressedCollection) {

    var building,
        buttonPressedCollection = new ButtonPressedCollection(),
        elevator = new Elevator({
            buttonPressedCollection: buttonPressedCollection
        });


    building = new Building({
        numberOfFloors: 5,
        elevator: elevator,
        buttonPressedCollection: buttonPressedCollection
    });

    building.render();
    building.installElevator();
    elevator.start().render();
});
