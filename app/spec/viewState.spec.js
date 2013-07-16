/*global describe:false, beforeEach:false*, chai:false, it:false, require:false*/

describe( "When there is a Backbone-State-Machine,", function () {


    var bbsm,
        invalidStateTriggered,
        expect = chai.expect,
        triggeredEvents,
        calledMethods;

    // Includel a stack trace when needed
    // chai.Assertion.includeStack = true;

    beforeEach(function() {

        triggeredEvents = [];
        calledMethods = [];

        bbsm = new BBSM({
            initialState : "notStarted",
            states : {
                "notStarted" : {
                    start : function () {
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
                    _onEnter : function () {

                    },
                    allowedTransitions: [
                        // Final state
                    ]
                }
            },
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
                onNotHandled: [
                    function(methodName) {

                    }
                ]
            }
        });
    });

    it("it exists", function() {
       expect(bbsm).to.not.be.undefined;
    });

    it("the states are stored", function() {
        expect(_.difference(bbsm.getStates()
            , ["notStarted", "started", "finished"]).length).to.deep.equal([]);
    });

    describe("the initial state", function() {

        it("is set", function() {
            expect(bbsm.getState()).to.equal("notStarted");
        });

        it("has its onExit method attached if supplied", function() {
            expect(typeof bbsm.onExit).to.equal("function");
        });

    });

    describe("transitioning", function() {

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
            expect(triggeredEvents[0]).to.deep.equal({onBegin: 'transitioning'});
        });

        it("lastly triggers a 'onFinish' event with 'transtioning' as the argument", function() {
            expect(triggeredEvents[triggeredEvents.length - 1]).to.deep.equal({onFinish: 'transitioning'});
        });

        it("fires an event that includes the previous and current states in the payload", function() {
            expect(transitioned).to.be.false;
            bbsm.transition("started");
            expect(transitioned).to.deep.equal({
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
                expect(bbsm.getState()).to.equal("started");
            });

            it("secondly fires an 'onExit' describing the state being exited", function() {
                expect(triggeredEvents[1]).to.deep.equal({
                    onExit: "notStarted"
                });
            });

            it("thirdly fires a 'change' method describing the states transitioned from and to", function() {
                expect(triggeredEvents[2]).to.deep.equal({
                    previous: "notStarted",
                    current: "started"
                });
            });

            it("fourthly fires an 'onEnter' describing the state being entered", function() {
                expect(triggeredEvents[3]).to.deep.equal({
                    onEnter: "started"
                });
            });

            it("calls the 'onExit' method of the old state", function() {
                expect(calledMethods[0]).to.deep.equal("notStarted.onExit()");
            });

            it("calls the 'onEnter' method of the new state", function() {
                expect(calledMethods[1]).to.deep.equal("started.onEnter()");
            });
        });

        describe("to a disallowed state", function() {

            it("does not change state", function() {
                bbsm.transition("blah");
                expect(bbsm.getState()).not.to.equal("blah");
            });

        });

        // TODO: test calling unhandled method is a noop and not an error
        // TODO: test calling unhandled onEnter and onExit
    });

    describe("a state", function() {

        it("gets its methods attached", function() {

            var notStartedMethods = ["start", "onExit"];
            expect(bbsm.getState()).to.equal("notStarted");
            _.forEach(notStartedMethods, function(methodName) {
                expect(typeof bbsm[methodName]).to.equal("function");
            });
        });

        it("does not get its allowedTransitions attached as a field", function() {
            expect(typeof bbsm.allowedTransitions).to.equal("undefined");
        });

        it("can be queried about its allowedTransitions using, 'getAllowedTransitions'", function() {
            expect(bbsm.getAllowedTransitions("started")).to.deep.equal(["finished"]);
        });

        it("triggers a 'notHandled' event if a method from another state is called", function() {

        });
    });
    //TODO: add separate two instances test
} );
