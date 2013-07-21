# Backbone State Machine

The Backbone State Machine (BBSM) is a Backbone View that has a built in finite state machine.
Finite state machines are useful for organizing and simplifying your code in cases where
your app functions in different ways depending on what has transpired previously.

BBSM allows you to define a number of states, the methods available on each state, and the
the states you are allowed to transition to from each of the defined states.

BBSM fires events when transitioning and to warn of unhandled transitions and unhandled
method calls. The fired events are summarized [Events](#events).

http://pajtai.github.io/backbone-state-machine

* Tests:
http://pajtai.github.io/backbone-state-machine/spec

## Usage

An initializing object is used to setup the state machine:

```javascript
myStateMachine = new BBSM(initObject);
```

The initialization object contains the initial state referred to as a string, a states object
that describes each state as a field, and an array of event listeners you want to attach to your view.

```javascript
var initObject = {
    initialState: "theInitialState",
    states: {
        state1: state1Description,
        state2: state2Description,
        state3: state3Description
    },
    eventListeners: [
        { onMethodNotHandled: onMethodNotHandledListener },
        { exampleEvent: onExampleEventListener }
    ]
}
```

The state descriptions contain available methods - or references to them -
for each state, and an are of states that can be transitioned to from the state being
described:

```javascript
var state1Description = {

}
```

## Events

Upon a succesfull transition the following events are fired on the instance of the State
Machine in this order:

1. `.trigger('onBegin', 'transitioning')`
1. `.trigger('onExit', [the old state as a string])`
1.
```javascript
.trigger('trigger', {
    previous: [the old state as a string],
    current: [the new state as a string]
}
```
1. `.trigger('onEnter', [the new state as a string])`
1. `.trigger('onFinish', 'transitioning')`

* Setup

```
git clone ...
npm install
grunt server
```
