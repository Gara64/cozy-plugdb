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
        console.log 'render acls : ' + JSON.stringify acls
        console.log 'triggerid : ' + trigger.id
        @$el.html @template({triggerID: trigger.id, acls: acls, docType: docType})
        @renderACL(docType, acls)

    checkTrigger: (trigger) ->
        acls = []
        _this = @

        # TODO: FOR DEMO USE ONLY!!
        if trigger.id is "0a127ad5493b54992ea501a80f06d089"
            console.log 'particular id found'
            acls.push {id: "0a127ad5493b54992ea501a80f0565a6"}
            return acls

        rules.forEach (r) ->
            rule = r.toJSON()
            #console.log 'check rule ' + JSON.stringify rule
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
        trigACLs = []
        acls.forEach (acl) ->
            if acl?.trigger?.id is triggerID
                trigACLs.push acl
                console.log 'trigger ' + triggerID + ' match !'
        return trigACLs


    renderACL: (docType, acls) ->
        domain = window.location.origin
        if docType is 'documents'
            acls.forEach (acl) ->
                file = new File(id: acl.id)
                file.fetch({
                    success: () ->
                        #console.log 'file : ' + JSON.stringify file
                        filename = file.get('name')
                        href = domain+"/files/"+acl.id+"/attach/"+filename
                        $("#"+acl.id+" td:first a").attr('href', href)
                        $("#"+acl.id+" td:first a").text(filename)

                    error: (err) ->
                        $("#"+acl.id).remove()
                })
        else if docType is 'subjects'
            acls.forEach (acl) ->
                contact = new Contact(id: acl.id)
                contact.fetch({
                    success: () ->
                        #console.log 'contact : ' + JSON.stringify contact
                        href = "/contacts/"+acl.id+"/picture.png"
                        fn = contact.get('fn')
                        $("#"+acl.id+" td:first p").text("#{fn}")
                        $("#"+acl.id+" td:first img").attr('class', 'avatar')
                        $("#"+acl.id+" td:first img").attr('src', href)
                        $("#"+acl.id+" td:first img").attr('height', '50')
                        $("#"+acl.id+" td:first img").attr('width', '50')

                    error: (err) ->
                        $("#"+acl.id).remove()
                })




)
