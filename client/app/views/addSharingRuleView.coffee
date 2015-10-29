SharingRule = require '../models/sharingRule'

module.exports = AddSharingRuleView = Backbone.View.extend

    template: require '../templates/addSharingRule'
    tagName: 'div'

    events:
        'click #submitRule'    : 'submitRule'

    render: ->
        @$el.html @template()
        console.log 'add rule'

    submitRule: ->
        #TODO: add the new rule (+ doctype & co?)
        #newRule = new SharingRule

        #do this only if the rule has been correctly created
        #and notify the user
        @remove()
        @render()
