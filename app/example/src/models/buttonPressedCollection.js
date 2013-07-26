define([
    'backbone'
],function(Backbone){
    var ButtonPressed = Backbone.Model,
        ButtonPressedCollection = Backbone.Collection.extend({
            model: ButtonPressed
        });

    return ButtonPressedCollection;
});