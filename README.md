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

```
myStateMachine = new BBSM(initObject);
```

The initialization object contains the initial state referred to as a string, a states object
that describes each state as a field, and an array of event listeners you want to attach to your view.

```
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

The state description contain available methods - or references to them -
for each state, and an

## Events



* Setup

```
git clone ...
npm install
grunt server
```
