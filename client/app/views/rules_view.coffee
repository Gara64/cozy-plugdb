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
        @collection.add model, merge: true
    onRemoteUpdate: (model) ->
        console.log 'remote update rule'
        #@collection.set model
    onRemoteDelete: (model) ->
        console.log 'remote rule delete : ', model
        @collection.remove model

class TriggerListener extends CozySocketListener
    models:
        'trigger': Trigger
    events: [
        'trigger.create'
        'trigger.update'
        'trigger.delete'
    ]
    onRemoteCreate: (model) ->
        console.log 'remote trigger create : ', model
        @collection.add model, merge: true
    onRemoteUpdate: (model) ->
        console.log 'remote trigger rule'
        #@collection.set model
    onRemoteDelete: (model) ->
        console.log 'remote trigger delete : ', model
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
        'click a[name="show"]'        : 'showACL'
        'click a[name="remove"]'      : 'removeRule'
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
        @listenTo @collection, 'ping', @render

        @listenTo triggers, 'add'   , @render
        @listenTo triggers, 'remove', @render
        @listenTo triggers, 'reset' , @render

        @render()

        realtimerRule = new RuleListener()
        realtimerRule.watch @collection
        realtimerTrigger = new TriggerListener()
        realtimerTrigger.watch triggers

        triggers.fetch(reset: true)
        return

    render: ->

        @collection.forEach (model) ->
            model.getSensitiveTags (err, tags) ->
                model.set({"tags": tags})


        #console.log 'rules : ', JSON.stringify @collection.toJSON()
        #console.log 'triggers : ', JSON.stringify(triggers)

        # render the template
        @$el.html @template({rules: @collection.toJSON(), triggers: triggers.toJSON()})

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
        triggerType = @$el.find("#triggertype option:selected" ).attr("name")
        console.log 'trigger type : ' + triggerType
        att1 = @$el.find('input[name="triggerattribute"]').val()
        val1 = @$el.find('input[name="triggervalue"]').val()
        console.log 'att : ' + att1
        console.log 'val : ' + val1
        if triggerType is "which"
            att2 = @$el.find('input[name="triggerattribute2"]').val()
            val2 = @$el.find('input[name="triggervalue2"]').val()

            trigger = new Trigger(
                id: null,
                type: triggerType,
                who:
                    att: att1
                    val: val1
                what:
                    att: att2
                    val: val2
            )
        else if triggerType is "who"
            trigger = new Trigger(
                id: null,
                type: triggerType,
                who:
                    att: att1
                    val: att1
            )
        else if triggerType is "what"
            trigger = new Trigger(
                id: null,
                type: triggerType,
                what:
                    att: att1
                    val: att1
            )
        console.log 'trigger : ', JSON.stringify trigger
        trigger.save()
        triggers.add trigger


    triggerForm: (event) ->
        event.preventDefault()
        triggerType = @$el.find("#triggertype option:selected" ).attr("name")
        if triggerType == "who"
            @$el.find('#triggeratt1').text('Attribute Who')
            @$el.find('#triggerval1').text('Value Who')
        else if triggerType == "what"
            @$el.find('#triggeratt1').text('Attribute What')
            @$el.find('#triggerval1').text('Value What')
        else if triggerType == "which"
            $("#triggerattblock").attr('style', 'display:block')
            $("#triggervalblock").attr('style', 'display:block')
            @$el.find('#triggeratt1').text('Attribute Who')
            @$el.find('#triggerval1').text('Value Who')
            @$el.find('#triggeratt2').text('Attribute What')
            @$el.find('#triggerval2').text('Value What')

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
