Trigger = require '../models/trigger'
Rules = require '../collections/rules'
rules = new Rules()

module.exports = TriggerView = Backbone.View.extend(
    el: '#trigger'
    template: require('../templates/triggers')

    initialize: ->
        ###
        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render
        ###
        @listenTo rules, 'add'   , @render
        @listenTo rules, 'remove', @render
        @listenTo rules, 'reset' , @render

        rules.fetch reset: true

    render: () ->
        console.log 'render trigger'
        trigger = @model.toJSON()
        if trigger.type == "who"
            docType = "user"
        else if trigger.type == "what"
            docType = "doc"
        else if trigger.type == "which"
            docType.type = "association"


        results = @checkTrigger trigger

        #@$el.html @template({trigger: trigger, docType: docType})


    checkTrigger: (trigger) ->
        results = {}
        _this = @
        rules.forEach (r) ->
            rule = r.toJSON()
            console.log 'check rule ' + JSON.stringify rule
            if trigger.type is 'who'
                uACLs = _this.findTrigger trigger.id, rule.userIDs
                results["users"] = uACLs
            else if trigger.type is 'what'
                dACLs = _this.findTrigger trigger.id, rule.docIDs
                results["docs"] = dACLs
            else if trigger.type is 'which'
                uACLs = _this.findTrigger trigger.id, rule.userIDs
                results["users"] = uACLs
                dACLs = _this.findTrigger trigger.id, rule.docIDs
                results["docs"] = dACLs

    findTrigger: (triggerID, acls) ->
        acls = []
        console.log 'acls : ', JSON.stringify acls
        acls.forEach (acl) ->
            if acl?.trigger?.id is triggerID
                acls.push acl
                console.log 'trigger match !'

)
