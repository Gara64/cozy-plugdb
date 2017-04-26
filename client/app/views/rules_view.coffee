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
    template: require('../templates/rules')

    events :
        "change"                          : "onChange"
        'click input[name="show"]'        : 'showACL'

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
        rules = []
        @collection.forEach (model) ->
            id = model.get("id")
            filterDoc = model.get('filterDoc').rule
            filterSub = model.get('filterUser').rule
            rules.push {id: id, fDoc: filterDoc, fSub: filterSub}

        console.log 'rules : ', JSON.stringify(rules)

        # render the template
        @$el.html @template({rules: rules})

        return

    showACL: (event) ->
        event.preventDefault()
        console.log 'show must go on'
        console.log 'event : ', JSON.stringify $(event.relatedTarget)
        console.log 'event : ', JSON.stringify $(event.delegateTarget)
        console.log('event : ', JSON.stringify($(event.currentTarget).val()))
)
