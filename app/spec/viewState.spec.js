/*global describe:false, beforeEach:false*, chai:false, it:false, require:false*/

describe( "When there is a ViewState,", function () {

    var stateView,
        stateView2,
        invalidStateTriggered,
        expect = chai.expect,
        triggeredStates;

    beforeEach(function() {

        triggeredStates = [];

        stateView = new StateView({
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
                onFinish: [
                    function(state) {
                        triggeredStates.push({onFinish: state});
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
                ]
            }
        });

        stateView2 = new StateView({
            initialState : "stopped",
            states : {
                "started" : {
                    finish : function () {
                        this.transition( "finished" );
                    },
                    allowedTransitions: [
                        "finished"
                    ]
                },
                "stopped" : {
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
                ]
            }
        });
    });

    it("it exists", function() {
       expect(stateView).to.not.be.undefined;
    });

    it("the states are stored", function() {
        expect(_.difference(stateView.getStates()
            , ["notStarted", "started", "finished"]).length).to.deep.equal([]);
    });

    describe("the initial state", function() {

        it("is set", function() {
            expect(stateView.getState()).to.equal("notStarted");
            expect(stateView2.getState()).to.equal("stopped");
        });

    });

    describe("transitioning", function() {

        var transitioned;

        beforeEach(function() {

            stateView.listenTo(stateView, "transition", transition);
            transitioned = false;

            function transition() {
                transitioned = true;
            }
        });

        it("first triggers an 'onBegin' event with 'transitioning' as the argument", function() {
            expect(triggeredStates[0]).to.deep.equal({onBegin: 'transitioning'});
        });

        it("lastly triggers a 'onFinish' event with 'transtioning' as the argument", function() {
            expect(triggeredStates[triggeredStates.length - 1]).to.deep.equal({onFinish: 'transitioning'});
        });

        it("fires an event", function() {
            expect(transitioned).to.be.false;
            stateView.transition("started");
            expect(transitioned).to.be.true;
        });

        describe("to an allowed state", function() {

            it("does so", function() {
                stateView.transition("started");
                expect(stateView.getState()).to.equal("started");
            });
        });

        describe("to a disallowed state", function() {

            it("does not change state", function() {
                stateView.transition("blah");
                expect(stateView.getState()).not.to.equal("blah");
            });

        });
    });
} );
