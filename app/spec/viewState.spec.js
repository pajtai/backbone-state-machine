/*global describe:false, beforeEach:false*, chai:false, it:false, require:false*/

describe( "When there is a Backbone-State-Machine,", function () {

    var bbsm,
        invalidStateTriggered,
        expect = chai.expect,
        triggeredStates;
        // should = chai.should;

    // Includel a stack trace when needed
    // chai.Assertion.includeStack = true;

    beforeEach(function() {

        triggeredStates = [];

        bbsm = new BBSM({
            initialState : "notStarted",
            states : {
                "notStarted" : {
                    start : function () {
                        this.transition( "started" );
                    },
                    allowedTransitions: [
                        "started"
                    ]
                },
                "started" : {
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
                        triggeredStates.push({onBegin: state});
                    }
                ],
                onEnter: [
                    function(state) {
                        triggeredStates.push({onEnter: state});
                    }
                ],
                onExit: [
                    function(state) {
                        triggeredStates.push({onExit: state});
                    }
                ],
                onFinish: [
                    function(state) {
                        triggeredStates.push({onFinish: state});
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

    });

    describe("transitioning", function() {

        var transitioned;

        beforeEach(function() {

            bbsm.listenTo(bbsm, "transition", transition);
            transitioned = false;

            function transition(description) {
                transitioned = description;
                triggeredStates.push(description);
            }
        });

        it("first triggers an 'onBegin' event with 'transitioning' as the argument", function() {
            expect(triggeredStates[0]).to.deep.equal({onBegin: 'transitioning'});
        });

        it("lastly triggers a 'onFinish' event with 'transtioning' as the argument", function() {
            expect(triggeredStates[triggeredStates.length - 1]).to.deep.equal({onFinish: 'transitioning'});
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
                triggeredStates = [];
                bbsm.transition("started");
            });

            it("does so", function() {
                expect(bbsm.getState()).to.equal("started");
            });

            it("secondly fires an 'onExit' describing the state being exited", function() {
                expect(triggeredStates[1]).to.deep.equal({
                    onExit: "notStarted"
                });
            });

            it("thirdly fires a 'change' method describing the states transitioned from and to", function() {
                expect(triggeredStates[2]).to.deep.equal({
                    previous: "notStarted",
                    current: "started"
                });
            });

            it("fourthly fires an 'onEnter' describing the state being entered", function() {
                expect(triggeredStates[3]).to.deep.equal({
                    onEnter: "started"
                });
            });
        });

        describe("to a disallowed state", function() {

            it("does not change state", function() {
                bbsm.transition("blah");
                expect(bbsm.getState()).not.to.equal("blah");
            });

        });
    });

    //TODO: add separate two instances test
} );
