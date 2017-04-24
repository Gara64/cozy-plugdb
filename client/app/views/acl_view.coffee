acl = require '../models/acl'


class ContactListener extends CozySocketListener
    models:
        'acl': acl

module.exports = ACLView = Backbone.View.extend(
    el: '#acl'
    template: require('../templates/acl')

    initialize: ->
        @render()
        return


    render: ->
        console.log 'render acl view'
        # render the template
        @$el.html @template()
        return
)
