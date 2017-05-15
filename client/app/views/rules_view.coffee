Rule = require '../models/rule'
Rules = require '../collections/rules'
ACLView = require './acl_view'
Tags = require '../collections/tags'
Triggers = require '../collections/triggers'
Trigger = require '../models/trigger'
triggers = new Triggers()


class RuleListener extends CozySocketListener
    models:
        'sharingrule': Rule
    events: [
        'sharingrule.create'
        'sharingrule.update'
        'sharingrule.delete'
    ]
    onRemoteCreate: (model) ->
        console.log 'remote rule create : ', model
        @collection.add model
    onRemoteUpdate: (model) ->
        console.log 'remote update rule'
    onRemoteDelete: (model) ->
        console.log 'remote rule delete : ', model
        @collection.remove model


module.exports = RuleView = Backbone.View.extend(
    el: '#rule'
    template: require('../templates/rules')

    events :
        "change"                          : "onChange"
        'click #addsharingrule'           : 'showRuleCreationForm'
        'click #addtrigger'               : 'showTriggerCreationForm'
        'click #createRule'               : 'createRule'
        'click #createTrigger'            : 'createTrigger'
        'click input[name="show"]'        : 'showACL'
        'click input[name="remove"]'      : 'removeRule'
        'change #triggertype'              : 'triggerForm'

    onChange : (event) ->
        event.preventDefault()
        console.log "target : ", event.target

    initialize: ->
        # Do not listen the changes to avoid a render each time
        # an acl is changed
        #@listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render

        @render()

        realtimerRule = new RuleListener()
        realtimerRule.watch @collection
        console.log 'watch rules : ', JSON.stringify @collection

        return

    render: ->
        rules = []
        @collection.forEach (model) ->
            id = model.get("id")
            #console.log 'model : ', JSON.stringify model

            if model.get('filterDoc') != null
                filterDoc = model.get('filterDoc').rule
                filterSub = model.get('filterUser').rule
                docIDs = model.get('docIDs')
                userIDs = model.get('userIDs')
                rules.push {
                    id: id,
                    fDoc: filterDoc,
                    fSub: filterSub,
                    docIDs: docIDs,
                    userIDs: userIDs
                }

            model.getSensitiveTags (err, tags) ->
                model.set({"tags": tags})
                console.log 'model : ' + JSON.stringify model


        #console.log 'rules : ', JSON.stringify(rules)

        # render the template
        @$el.html @template({rules: rules})

        return

    showACL: (event) ->
        event.preventDefault()
        id = $(event.currentTarget).data("id")
        rule = @collection.get(id)
        status = $(event.currentTarget).data("status")

        console.log('display : ' + $("#"+rule.id).attr('style'))
        style = $("#"+rule.id).attr('style')
        if style == undefined
            aclView = new ACLView({model: rule})
        else if style == 'display:block'
            $("#"+rule.id).attr('style', 'display:none')
        else
            $("#"+rule.id).attr('style', 'display:block')

        ###
        if style?
            $("#"+rule.id).attr('style', 'display:none')
        else
            aclView = new ACLView({model: rule})
        ###
        #curACLView = aclView
        #console.log 'model id saved : ', curACLView.model.get('id')


    createRule: (event) ->
        event.preventDefault()
        docType = @$el.find('input[name="doctype"]').val()
        docAttr = @$el.find('input[name="docattr"]').val()
        docVal = @$el.find('input[name="docval"]').val()
        subAttr = @$el.find('input[name="subattr"]').val()
        subVal = @$el.find('input[name="subval"]').val()

        docTypeDocPred = 'doc.docType === "'+docType+'"'
        docAttrPred = ''
        if docAttr
            docAttrPred = ' && doc.'+docAttr+'.indexOf("'+docVal+'") > -1'

        docTypeSubPred = 'doc.docType === "contact"'
        subAttrPred = ''
        if subAttr
            subAttrPred = ' && doc.'+subAttr+'.indexOf("'+subVal+'") > -1'

        docPred = docTypeDocPred + docAttrPred
        subPred = docTypeSubPred + subAttrPred

        filterDoc = {
            rule: docPred
        }
        filterUser = {
            rule: subPred
        }
        rule = new Rule(
            id: null,
            filterDoc: filterDoc,
            filterUser: filterUser
        )
        rule.save()
        @collection.add rule
        $("#createrule").attr('style', 'display:none')


    removeRule: (event) ->
        id = $(event.currentTarget).data("id")
        console.log 'id : ', id
        rule = @collection.get(id)

        # Destroy the model: sends delete to the server
        rule.destroy()
        # Destroy from the colleciton: update the render
        @collection.remove rule

    createTrigger: (event) ->
        event.preventDefault()
        triggerType = @$el.find("#triggertype option:selected" ).text()
        att = @$el.find('input[name="triggerattribute"]').val()
        val = @$el.find('input[name="triggervalue"]').val()
        console.log 'type : ' + triggerType
        console.log 'att : ' + att
        console.log 'val : ' + val
        trigger = new Trigger(
            id: null,
            type: triggerType
        )
        triggers.add trigger


    triggerForm: (event) ->
        event.preventDefault()
        triggerType = @$el.find("#triggertype option:selected" ).text()
        if triggerType == "Who"
            @$el.find('#triggeratt1').text('Attribute Who')
            @$el.find('#triggerval1').text('Val Who')
        else if triggerType == "What"
            @$el.find('#triggeratt1').text('Attribute What')
            @$el.find('#triggerval1').text('Val What')
        else if triggerType == "Which"
            $("#triggerattblock").attr('style', 'display:block')
            $("#triggervalblock").attr('style', 'display:block')
            @$el.find('#triggeratt1').text('Attribute Who')
            @$el.find('#triggerval1').text('Val Who')
            @$el.find('#triggeratt2').text('Attribute What')
            @$el.find('#triggerval2').text('Val What')

    showRuleCreationForm: (event) ->
        event.preventDefault()
        $("#createtrigger").attr('style', 'display:none')
        style = $("#createrule").attr('style')
        if style == 'display:block'
            $("#createrule").attr('style', 'display:none')
        else if style == 'display:none'
            $("#createrule").attr('style', 'display:block')

    showTriggerCreationForm: (event) ->
        event.preventDefault()
        $("#createrule").attr('style', 'display:none')
        style = $("#createtrigger").attr('style')
        if style == 'display:block'
            $("#createtrigger").attr('style', 'display:none')
        else if style == 'display:none'
            $("#createtrigger").attr('style', 'display:block')
)
