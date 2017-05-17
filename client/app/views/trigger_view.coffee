Trigger = require '../models/trigger'

module.exports = TriggerView = Backbone.View.extend(
    el: '#trigger'
    template: require('../templates/triggers')

    initialize: ->
        ###
        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render
        ###
        @render()

    render: () ->
        trigger = @model.toJSON()
        if trigger.type == "who"
            docType = "user"
        else if trigger.type == "what"
            docType = "doc"
        else if trigger.type == "which"
            docType.type = "association"

        @$el.html @template({trigger: trigger, docType: docType})

)
