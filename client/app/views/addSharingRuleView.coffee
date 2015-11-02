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
        name = $('#ruleName').val()
        fDoc = $('#filterDoc').val()
        dUserDesc = $('#docUserDesc').val()
        fUser= $('#filterUser').val()
        uUserDesc = $('#userUserDesc').val()

        if @checkAttributes name, fDoc, fUser
            filterDoc = {rule: fDoc, userDesc: dUserDesc}
            filterUser = {rule: fUser, userDesc: uUserDesc}

            newRule = new SharingRule {name, filterDoc, filterUser}
            newRule.save()
            @collection.add newRule

            #do this only if the rule has been created and notify the user
            @remove()
            @render()
        else
            alert 'Please enter all mandatory fields'

    checkAttributes: (name, filterDoc, filterUser) ->
        return name? and filterDoc? and filterUser?
