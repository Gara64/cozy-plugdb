Plug = require('../models/plug')
Rules = require('../collections/rules')
Contacts = require('../collections/contacts')
Triggers = require('../collections/triggers')
aclView = require './acl_view'
ruleView = require './rules_view'
triggerView = require './trigger_view'
perfsView = require './perfs_view'

#var Device = require('../models/device');
module.exports = AppView = Backbone.View.extend(
    el: 'body'
    template: require('../templates/home')

    # Automatically called once after the view is constructed
    initialize: ->
        return

    # Called by the router
    render: ->
        model = @model

        # render the home template
        @$el.html @template()

        # Trigger view
        triggers = new Triggers()
        triggers.fetch(reset: true)
        #triggerView = new triggerView(collection: triggers)

        # Sharing rule view
        rules = new Rules()
        rules.fetch(reset:true)
        ruleView = new ruleView(collection: rules)

        # Perfs view
        perfsView = new perfsView()




)
