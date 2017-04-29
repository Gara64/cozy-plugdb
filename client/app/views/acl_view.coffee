Rule = require '../models/rule'

module.exports = ACLView = Backbone.View.extend(
    el: '#acl'
    template: require('../templates/acl')

    initialize: (rule)->
        @render(rule)

    render: (rule) ->
        @$el.html @template({rule: rule})
)
