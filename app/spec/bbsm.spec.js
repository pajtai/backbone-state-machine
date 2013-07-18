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
        allEvents = [];

        bbsm = new BBSM({
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
                invalidstate: [
                    function() {
                        invalidStateTriggered = true;
                    }
                ],
                onBegin: [
                    function(state) {
                        triggeredEvents.push({onBegin: state});
                    }
                ],
                onEnter: [
                    function(state) {
                        triggeredEvents.push({onEnter: state});
                    }
                ],
                onExit: [
                    function(state) {
                        triggeredEvents.push({onExit: state});
                    }
                ],
                onFinish: [
                    function(state) {
                        triggeredEvents.push({onFinish: state});
                    }
                ],
                onTransitionNotHandled: [
                    function(stateName) {
                        triggeredEvents.push({onTransitionNotHandled: stateName});
                    }
                ],
                onMethodNotHandled: [
                    function(methodName) {
                        triggeredEvents.push({onMethodNotHandled: methodName});
                    }
                ]
            }
        });

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

    describe("is started using .start", function() {
        it("stores the states from the passed in objects .states", function() {
            bbsm.getStates().should.deep.equal(["notStarted", "started", "finished"]);
        });

        describe("the initial state", function() {

            it("is set", function() {
                bbsm.getState().should.equal("notStarted");
            });

            it("does not have its onExit method attached if supplied", function() {
                (typeof bbsm.onExit).should.equal("undefined");
            });

        });

        describe("transitions, and it", function() {

            var transitioned;

            beforeEach(function() {

                bbsm.listenTo(bbsm, "transition", transition);
                transitioned = false;

                function transition(description) {
                    transitioned = description;
                    triggeredEvents.push(description);
                }
            });

            it("first triggers an 'onBegin' event with 'transitioning' as the argument", function() {
                console.log("middle");
                allEvents.should.equal("onBegin");
                triggeredEvents[0].should.deep.equal({onBegin: 'transitioning'});
            });

            it("lastly triggers a 'onFinish' event with 'transtioning' as the argument", function() {
                triggeredEvents[triggeredEvents.length - 1].should.deep.equal({onFinish: 'transitioning'});
            });

            it("fires an event that includes the previous and current states in the payload", function() {
                transitioned.should.be.false;
                bbsm.transition("started");
                transitioned.should.deep.equal({
                    previous: "notStarted",
                    current: "started"
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

                it("secondly fires an 'onExit' describing the state being exited", function() {
                    triggeredEvents[1].should.deep.equal({
                        onExit: "notStarted"
                    });
                });

                it("thirdly fires a 'change' method describing the states transitioned from and to", function() {
                    triggeredEvents[2].should.deep.equal({
                        previous: "notStarted",
                        current: "started"
                    });
                });

                it("fourthly fires an 'onEnter' describing the state being entered", function() {
                    triggeredEvents[3].should.deep.equal({
                        onEnter: "started"
                    });
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

        describe("a state", function() {

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
        //TODO: add separate two instances test
    });
});
