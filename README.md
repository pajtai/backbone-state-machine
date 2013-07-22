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

## Dev Setup

```
git clone ...
npm install
grunt server
```

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
for each state, and an array of states that can be transitioned to from the state being
described:

```javascript
var state1Description = {
    methodAvailable1: methodAvailable1,
    methodAvailable2: methodAvailable2,
    onEnter: onEnterState1,
    onExit: onExitState1,
    allowedTransisition: [
        "state2", "state5"
    ]
}
```

## Entering and Exiting States

When entering a state, its `onEnter` method will be called if it exists. When exiting a
state, its `onExit` method will be called if it exists.

The methods are automatically triggered by the `onEnter` and `onExit` events, and the
calling of the correct method is handled by BBSM.

## Events

Upon a succesfull transition the following events are fired - in this order - on the instance of the State
Machine in this order:

1.
```javascript
bbsmInstance.trigger('onBegin', 'transitioning')
```
1.
```javascript
bbsmInstance.trigger('onExit', [the old state as a string])
```
1.
```javascript
bbsmInstance.trigger('transition', {
    previous: [the old state as a string],
    current: [the new state as a string]
}
```
1.
```javascript
bbsmInstance.trigger('onEnter', [the new state as a string])
```
1.
```javascript
bbsmInstance.trigger('onFinish', 'transitioning')
```

The `onExit` event triggers a call the previous state's `onExit` method if it
exists. The `onEnter` event trigger a call to the current state's `onEnter` method if
it exists.

The `transition` even is triggred by a `change` listener attached to the `.stateModel`
of the BBSM instance.
