/*global describe:false, beforeEach:false*, chai:false, it:false, require:false*/

describe( "A Backbone-State-Machine,", function () {


    var bbsm,
        should = chai.should(),
        triggeredEvents,
        allEvents,
        initObject,
        testListener;

    chai.Assertion.includeStack = false;

    beforeEach(function() {

        allEvents = [];
        initObject = {
            initialState : "notStarted",
            states : {
                "notStarted" : {
                    start : function () {
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

        bbsm = new BBSM(initObject);

        testListener = {};
        _.extend(testListener, Backbone.Events);
        testListener.listenTo(bbsm, "all", function() {
            allEvents.push(arguments);
        });
    });

    afterEach(function() {
        testListener.stopListening();
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
        });

        it("stores the states from the passed in objects .states", function() {
            bbsm.getStates().should.deep.equal(["notStarted", "started", "finished"]);
        });

        describe("has an initial state", function() {

            it("that is set", function() {
                bbsm.getState().should.equal("notStarted");
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

            describe(" - if it has a method called 'start' -", function() {
                it("will replace bbsm.start with its own method", function() {
                    bbsm.start.should.not.equal(originalStartMethod);
                });
            });

            it("gets its methods attached", function() {

                var notStartedMethods = ["start"];
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
            // TODO: test calling unhandled onEnter and onExit
        });
        //TODO: add separate two instances test
    });
});
