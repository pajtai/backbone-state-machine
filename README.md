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

## Installation

```
bower install backbone-state-machine
```

## Dev Setup

```
git clone ...
npm install
grunt server
```

## Usage

### Summary

Step 1: Extend BBSM adding mneeded methods and a description of the states

```javascript
var MyBBSM = BBSM.extend({
    initialize: function() {
        // Call super
        MyBBSM.initialize.__super__.initialize.apply(this, arguments);
        // Then customize
        // ...
    },
    render: function() { ... },
    state: {
        ...
    }
    ...
    ...
});
```

Step 2: Start the State Machine

```javascript
// First create an instance
var bbsm = new MyBBSM();

// Finally, start the State Machine
bbsm.start();

// Transition to other allowed states
bbsm.transition("exampleStatw");

// Call methods in the state on the instance directly
bbsm.exampleMethod();
```

### Step by Step

To customize BBSM, you have to first extend it.

#### Extending BBSM

BBSM can be extended like any other view with the important restriction that `.initialize`
must be called on BBSM itself. This can be done using either the `prototype` or Backbone's
convenience `__super__`.

If you do not override initialize, then you don't have to worry about this.

Below is an example using `__super__` and an override of `.initialize`

```javascript
var CustomBBSM = BBSM.extend({
    el: "#customEl",
    initialize: function() {
        CustomBBSM.__super__.initialize.apply(this, arguments);
        // Now you can cusomize initialize here
        ...
    },
    render: function() {
        ...
    },
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

The intiial state is optional, and it transitioned to upon calling `bbsmInstance.start()`.
If not provided, the initial state will not exist (it will be `undefined`), but you can
then transition to any state using `.transition`.

The state descriptions contain available methods - or references to them -
for each state, and an array of states as strings that can be transitioned to from the state being
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

### Entering and Exiting States

When entering a state, its `onEnter` method will be called if it exists. When exiting a
state, its `onExit` method will be called if it exists.

The methods are automatically triggered by the `onEnter` and `onExit` events, and the
calling of the correct method is handled by BBSM.

### Events

Upon a succesfull transition the following events are fired - in this order - on the instance of the State
Machine in this order:

1:
```javascript
bbsmInstance.trigger('onBegin', 'transitioning')
```
2:
```javascript
bbsmInstance.trigger('onExit', [the old state as a string])
```
3:
```javascript
bbsmInstance.trigger('transition', {
    previous: [the old state as a string],
    current: [the new state as a string]
}
```
4:
```javascript
bbsmInstance.trigger('onEnter', [the new state as a string])
```
5:
```javascript
bbsmInstance.trigger('onFinish', 'transitioning')
```

The `onExit` event triggers a call the previous state's `onExit` method if it
exists. The `onEnter` event trigger a call to the current state's `onEnter` method if
it exists.

The `transition` even is triggred by a `change` listener attached to the `.stateModel`
of the BBSM instance.

## Release Notes:

* 2013-07-24 -
* 2013-07-22 - 0.0.3
