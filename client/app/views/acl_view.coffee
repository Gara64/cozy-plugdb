acl = require '../models/acl'


class ACLListener extends CozySocketListener
    models:
        'acl': acl
    events: [
        'acl.create'
        'acl.update'
        'acl.delete'
    ]
    onRemoteCreate: (model) ->
        @collection.add model
    onRemoteDelete: (model) ->
        @collection.remove model


module.exports = ACLView = Backbone.View.extend(
    el: '#acl'
    template: require('../templates/acl')

    events :
        "change" : "onChange"

    onChange : (e) ->
        console.log "target : ", e.target
        e.preventDefault()


    initialize: ->
        @render()
        return


    render: ->
        console.log 'render acl view'
        # render the template
        @$el.html @template()
        return
)
