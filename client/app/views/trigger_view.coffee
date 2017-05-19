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
            docType = "subjects"
        else if trigger.type == "what"
            docType = "documents"
        else if trigger.type == "which"
            docType.type = "associations"

        acls = @checkTrigger trigger
        @$el.html @template({triggerID: trigger.id, acls: acls, docType: docType})
        @renderACL(docType, acls)

    checkTrigger: (trigger) ->
        acls = []
        _this = @
        rules.forEach (r) ->
            rule = r.toJSON()
            console.log 'check rule ' + JSON.stringify rule
            if trigger.type is 'who'
                acls = _this.findTrigger trigger.id, rule.userIDs
            else if trigger.type is 'what'
                acls = _this.findTrigger trigger.id, rule.docIDs
            ###
            else if trigger.type is 'which'
                uACLs = _this.findTrigger trigger.id, rule.userIDs
                results["users"] = uACLs
                dACLs = _this.findTrigger trigger.id, rule.docIDs
                results["docs"] = dACLs
            ###


        return acls


    findTrigger: (triggerID, acls) ->
        console.log 'acls : ', JSON.stringify acls
        acls.forEach (acl) ->
            if acl?.trigger?.id is triggerID
                acls.push acl
                console.log 'trigger match !'
        return acls


    renderACL: (docType, acls) ->
        domain = window.location.origin
        if docType is 'documents'
            acls.forEach (acl) ->
                file = new File(id: acl.id)
                file.fetch({
                    success: () ->
                        console.log 'file : ' + JSON.stringify file
                        filename = file.get('name')
                        href = domain+"/files/"+acl.id+"/attach/"+filename
                        $("#"+acl.id+" td:first a").attr('href', href)
                        $("#"+acl.id+" td:first a").text(filename)

                    error: (err) ->
                        $("#"+acl.id+" p").text("deleted")
                })
        else if docType is 'subjects'
            acls.forEach (acl) ->
                contact = new Contact(id: acl.id)
                contact.fetch({
                    success: () ->
                        console.log 'contact : ' + JSON.stringify contact
                        href = domain+"/contacts/"+acl.id+"/picture.png"
                        fn = contact.get('fn')
                        $("#"+acl.id+" td:first p").text("#{fn}")

                    error: (err) ->
                        $("#"+acl.id+" p").text("deleted")
                })




)
