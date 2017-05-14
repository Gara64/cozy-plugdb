Triggers = require '../collections/triggers'
Trigger = require '../models/trigger'

module.exports = TriggerView = Backbone.View.extend(
    el: '#trigger'
    template: require('../templates/triggers')

    initialize: ->
        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render
        @render()

    render: () ->
        @$el.html @template()

)
