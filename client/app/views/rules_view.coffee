Rule = require '../models/rule'
Rules = require '../collections/rules'

class RuleListener extends CozySocketListener
    models:
        'rule': Rule
    events: [
        'rule.create'
        'rule.update'
        'rule.delete'
    ]
    onRemoteCreate: (model) ->
        @collection.add model
    onRemoteDelete: (model) ->
        @collection.remove model

module.exports = RuleView = Backbone.View.extend(
    el: '#rule'
    template: require('../templates/acl')

    events :
        "change" : "onChange"

    onChange : (event) ->
        console.log "target : ", event.target
        event.preventDefault()


    initialize: ->
        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render

        realtimerRule = new RuleListener()
        realtimerRule.watch @collection

        @render()

        return


    render: ->
        @collection.forEach (model) ->
            console.log 'model rule : ', model.attributes

        # render the template
        @$el.html @template()
        return
)
