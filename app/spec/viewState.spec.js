describe( "When there is a ViewState,", function () {

    var stateView, stateView2, expect = chai.expect;

    beforeEach(function() {
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
                        invalidstateTriggered = true;
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
                        invalidstateTriggered = true;
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

    it("the initial state is set", function() {
        expect(stateView.getState()).to.equal("notStarted");
        expect(stateView2.getState()).to.equal("stopped");
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