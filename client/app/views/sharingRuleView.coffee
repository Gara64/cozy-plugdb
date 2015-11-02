
module.exports = SharingRuleView = Backbone.View.extend

    #className: 'sharingRule'
    template: require '../templates/sharingRule'
    tagName: 'div'
    className: 'sharingRule'

    events:
        'click #deleteRule'        : 'deleteRule'

    render: ->
        @$el.html @template sharingRule: @model.toJSON()
        console.log 'collection sharing rule: ' +  JSON.stringify @model


    deleteRule: ->
        console.log 'id : ' + @model.id
        @model.destroy() #destroy the model and request the server
        @remove() #remove the DOM element
