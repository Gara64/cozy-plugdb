Tags = require '../collections/tags'

module.exports = RuleView = Backbone.View.extend(
    el: '#rule'
    template: require('../templates/rules')

    onChange : (event) ->
        event.preventDefault()

    initialize: ->

        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render

        @render()
        return

    render: ->
        


)
