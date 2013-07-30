/*global describe:false, beforeEach:false*, chai:false, it:false, require:false*/

describe( "A Backbone-State-Machine,", function () {


    var bbsm,
        TestBBSM,
        should = chai.should(),
        allEvents,
        initObject,
        testListener;

    chai.Assertion.includeStack = false;

    //TODO: add test for context binding for onEnter and onExit
    //TODO: add methods that test shared functions among states
    //TODO: check that onEnter and onExit methods are not available outside of state
    beforeEach(function() {

        allEvents = [];
        initObject = {
            initialState : "notStarted",
            states : {
                "notStarted" : {
                    testMethod: function() {

                    },
                    onExit: function() {
                    },
                    allowedTransitions: [
                        "started"
                    ]
                },
                "started" : {
                    onEnter: function() {
                    },
                    finish : function () {
                    },
                    allowedTransitions: [
                        "finished"
                    ]
                },
                "finished" : {
                    allowedTransitions: [
                        // Final state
                    ]
                }
            },
            //TODO: should test that eventListeners are attached, but should not use them in the tests
            eventListeners: {
            }
        };

        sinon.spy(initObject.states.notStarted, "testMethod");

        // Setup a semi realistic use case with an overridden init method
        TestBBSM = BBSM.extend(initObject);
        bbsm = new TestBBSM();

        testListener = {};
        _.extend(testListener, Backbone.Events);
        testListener.listenTo(bbsm, "all", function() {
            allEvents.push(arguments);
        });
    });

    afterEach(function() {
        testListener.stopListening();
        initObject.states.notStarted.testMethod.restore();
    });

    it("does not get a state until .start() is called", function() {

        should.not.exist(bbsm.getState());
    });

    it("exists", function() {
       should.exist(bbsm);
    });

    describe("is started using .start(), and", function() {

        var originalStartMethod;

        beforeEach(function() {
            originalStartMethod = bbsm.start;
            bbsm.start();
            console.log("is: " + bbsm.initialState);
            console.log("- " + bbsm.getState());
        });

        it("stores the states from the passed in objects .states", function() {
            bbsm.getStates().should.deep.equal(["notStarted", "started", "finished"]);
        });

        describe("has an initial state", function() {

            it("that is set if provided", function() {
                bbsm.getState().should.equal("notStarted");
            });

            it("that is 'undefined' if not provided", function() {
                var bbsm2 = new (BBSM.extend({
                    states: {
                        first: {

                        }
                    }
                }));
                bbsm2.start();
                should.not.exist(bbsm2.getState());
            });
        });

        describe("a state", function() {

            it("does not have its onEnter method attached even if supplied", function() {
                bbsm.transition("started");
                should.exist(initObject.states[bbsm.getState()].onEnter);
                should.not.exist(bbsm.onEnter);
            });

            it("does not have its onExit method attached even if supplied", function() {
                var currentState = bbsm.getState();

                should.exist(initObject.states[currentState].onExit);
                should.not.exist(bbsm.onExit);
            });

            it("gets its methods attached", function() {

                var notStartedMethods = ["testMethod"];
                bbsm.getState().should.equal("notStarted");
                _.forEach(notStartedMethods, function(methodName) {
                    (typeof bbsm[methodName]).should.equal("function");
                });
            });

            it("does not get its allowedTransitions attached as a field", function() {
                should.not.exist(bbsm.allowedTransitions);
            });

            it("can be queried about its allowedTransitions using, 'getAllowedTransitions'", function() {
                bbsm.getAllowedTransitions("started").should.deep.equal(["finished"]);
            });

            it("triggers a 'notHandled' event if a method from another state is called", function() {
                allEvents = [];
                bbsm.getState().should.equal("notStarted");
                bbsm.finish();
                allEvents[0][0].should.equal("onMethodNotHandled");
                allEvents[0][1].should.equal("finish");
            });
        });

        describe(".transition()", function() {

            beforeEach(function() {
                allEvents = [];
                sinon.spy(initObject.states.notStarted, "onExit");
                sinon.spy(initObject.states.started, "onEnter");
                bbsm.transition("started");
            });

            afterEach(function() {
                initObject.states.notStarted.onExit.restore();
                initObject.states.started.onEnter.restore();
            });

            describe("fires the following events:", function() {

                it("1: triggers an 'onBegin' event with 'transitioning' as the argument", function() {
                    allEvents[0][0].should.equal("onBegin");
                    allEvents[0][1].should.equal("transitioning");
                });

                it("2: triggers an 'onExit' event with the previous state as the argument", function() {
                    allEvents[1][0].should.equal("onExit");
                    allEvents[1][1].should.equal("notStarted");
                });

                it("3: triggers a 'transition' event describing the two states involved", function() {
                    allEvents[2][0].should.equal("transition");
                    allEvents[2][1].should.deep.equal({
                        previous: "notStarted",
                        current: "started"
                    });
                });

                it("4: triggers an 'onEnter' event with the new state as the argument", function() {
                    allEvents[3][0].should.equal("onEnter");
                    allEvents[3][1].should.equal("started");
                });

                it("5: trigger an 'onFinish' event with transitioning as the argument", function() {
                    allEvents[4][0].should.equal("onFinish");
                    allEvents[4][1].should.equal("transitioning");
                });
            });

            describe("to an allowed state", function() {

                it("changes the state", function() {
                    var originalState = bbsm.getState();

                    bbsm.transition(bbsm.getAllowedTransitions(originalState)[0]);
                    bbsm.getState().should.not.equal(originalState);
                });

                it("calls the 'onExit' method of the old state", function() {
                   initObject.states.notStarted.onExit.should.have.been.called;
                });

                it("calls the 'onEnter' method of the new state", function() {
                    initObject.states.started.onEnter.should.have.been.called;
                });

                describe("without an 'onEnter' method", function() {
                    beforeEach(function() {

                        allEvents = [];
                        bbsm.transition("finished");
                    });

                    it("does not fire an 'onMethodNotHandled' event", function() {
                        _.forEach(allEvents, function(event) {
                            event[0].should.not.equal("onMethodNotHandled");
                        });
                    });
                });

                describe("from a state without an 'onExit' method", function() {

                    it("does not fire an 'onMethodNotHandled' event", function() {
                        _.forEach(allEvents, function(event) {
                            event[0].should.not.equal("onMethodNotHandled");
                        });
                    });
                });



            });

            describe("to a disallowed state", function() {

                var originalState;

                beforeEach(function() {
                    allEvents = [];
                    originalState = bbsm.getState();
                    bbsm.transition("blah");
                });

                it("does not change state", function() {
                    bbsm.getState().should.equal(originalState);

                });

                it("triggers an onTransitionNotHandled event with the failed state as an argument", function() {
                    allEvents[0][0].should.equal("onTransitionNotHandled");
                    allEvents[0][1].should.equal("blah");
                });

            });

            // TODO: test calling unhandled method is a noop and not an error
        });

        describe("methods", function() {

            describe("that are in the current state", function() {
                it("can be called", function() {
                    initObject.states.notStarted.testMethod.should.not.have.been.called;
                    bbsm.testMethod();
                    initObject.states.notStarted.testMethod.should.have.been.called;
                });
                it("use the proper context", function() {

                    // Setup a BBSM example that relies on context
                    var bbsm2 = new (BBSM.extend({
                        initialState: "first",
                        states: {
                            first: {
                                testMethod: function() {
                                    this.testField = this.testField + 1;
                                }
                            }
                        }
                    }));

                    bbsm2.start();
                    bbsm2.testField = 2;
                    bbsm2.testMethod();
                    bbsm2.testField.should.equal(3);
                });
            });

            describe("that are not in the current state (but in another state)", function() {
                beforeEach(function() {
                    bbsm.transition("started");
                    allEvents = [];
                });
                it("exist", function() {
                    should.exist(bbsm.testMethod);
                });
                it("cannot be successfully called", function() {
                    // 'started' state has not 'start' method
                    bbsm.transition("started");
                    initObject.states.notStarted.testMethod.should.not.have.been.called;
                    bbsm.testMethod();
                    initObject.states.notStarted.testMethod.should.not.have.been.called;
                });
                it("trigger an onMethodNotHandled event with the method names as the argument", function() {
                    bbsm.testMethod();
                    allEvents[0][0].should.equal("onMethodNotHandled");
                    allEvents[0][1].should.equal("testMethod");
                });
            });
        });
    });
});
