/*global describe:false, beforeEach:false*, chai:false, it:false, require:false*/

describe( "A Backbone-State-Machine,", function () {


    var bbsm,
        invalidStateTriggered,
        should = chai.should(),
        triggeredEvents,
        allEvents,
        calledMethods,
        testListener;

    // Includel a stack trace when needed
    chai.Assertion.includeStack = false;

    beforeEach(function() {

        triggeredEvents = [];
        calledMethods = [];
        allEvents = [],
        initObject = {
            initialState : "notStarted",
            states : {
                "notStarted" : {
                    start : function () {
                        console.log("attached start");
                        this.transition( "started" );
                    },
                    onExit: function() {
                        calledMethods.push("notStarted.onExit()")
                    },
                    allowedTransitions: [
                        "started"
                    ]
                },
                "started" : {
                    onEnter: function() {
                        calledMethods.push("started.onEnter()")
                    },
                    finish : function () {
                        this.transition( "finished" );
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
        console.log(allEvents);
        console.log("finish");
        testListener.stopListening();
    });

    it("does not get a state until .start is called", function() {

        should.not.exist(bbsm.getState());
    });

    it("exists", function() {
       should.exist(bbsm);
    });

    describe("is started using .start, and", function() {

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


            it("does not have its onExit method attached even if supplied", function() {
                var currentState = bbsm.getState();

                should.exist(initObject.states[currentState].onExit);
                (typeof bbsm.onExit).should.equal("undefined");
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
                (typeof bbsm.allowedTransitions).should.equal("undefined");
            });

            it("can be queried about its allowedTransitions using, 'getAllowedTransitions'", function() {
                bbsm.getAllowedTransitions("started").should.deep.equal(["finished"]);
            });

            it("triggers a 'notHandled' event if a method from another state is called", function() {
                triggeredEvents = [];
                bbsm.getState().should.equal("notStarted");
                bbsm.finish();
                triggeredEvents[0].should.deep.equal({
                    onMethodNotHandled: "finish"
                });
            });
        });

        describe("transitions", function() {

            beforeEach(function() {
                allEvents = [];
                bbsm.transition("started");
            });

            it("using .transition", function() {
                var originalState = bbsm.getState();

                bbsm.transition(bbsm.getAllowedTransitions(originalState)[0]);
                bbsm.getState().should.not.equal(originalState);
            });

            describe("and fires the following events:", function() {

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
                beforeEach(function() {
                    triggeredEvents = [];
                    calledMethods = [];
                    bbsm.transition("started");
                });

                it("does so", function() {
                    bbsm.getState().should.equal("started");
                });

                it("calls the 'onExit' method of the old state", function() {
                    calledMethods[0].should.deep.equal("notStarted.onExit()");
                });

                describe("with an 'onEnter' method", function() {
                    it("calls the 'onEnter' method of the new state", function() {
                        calledMethods[1].should.deep.equal("started.onEnter()");
                    });
                });

                describe("without an 'onEnter' method", function() {
                    var onMethodNotHandledCalled;

                    function onMethodNotHandledListener(info) {
                        onMethodNotHandledCalled = true;
                    }

                    beforeEach(function() {
                        onMethodNotHandledCalled = false;
                        triggeredEvents = [];
                        calledMethods = [];
                        bbsm.listenTo(bbsm, "onMethodNotHandled", onMethodNotHandledListener);
                        bbsm.transition("finished");
                    });

                    afterEach(function() {
                        bbsm.stopListening(bbsm, "onMethodNotHandled", onMethodNotHandledListener);
                    });

                    it("does not fire an 'onMethodNotHandled' event", function() {
                        onMethodNotHandledCalled.should.be.false;
                    });

                    describe("from a state without an 'onExit' method", function() {

                        it("does not fire an 'onMethodNotHandled' event", function() {
                            onMethodNotHandledCalled.should.be.false;
                        });
                        it("does not call the 'onEnter' method of the new state", function() {
                            calledMethods.length.should.equal(0);
                        });
                    });

                });



            });

            describe("to a disallowed state", function() {

                beforeEach(function() {
                    triggeredEvents = [];
                    bbsm.transition("blah");
                });

                it("does not change state", function() {
                    bbsm.getState().should.not.to.equal("blah");
                });

                it("triggers an onTransitionNotHandled event", function() {
                    triggeredEvents[0].should.deep.equal({
                        onTransitionNotHandled: "blah"
                    });
                });

            });

            // TODO: test calling unhandled method is a noop and not an error
            // TODO: test calling unhandled onEnter and onExit
        });
        //TODO: add separate two instances test
    });
});
