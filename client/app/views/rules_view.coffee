Rule = require '../models/rule'
Rules = require '../collections/rules'

class RuleListener extends CozySocketListener
    models:
        'sharingrule': Rule
    events: [
        'sharingrule.create'
        'sharingrule.update'
        'sharingrule.delete'
    ]
    onRemoteCreate: (model) ->
        console.log 'remote create : ', model
        @collection.add model
    onRemoteUpdate: (model) ->
        console.log 'update rule'
    onRemoteDelete: (model) ->
        console.log 'remote delete : ', model
        @collection.remove model

module.exports = RuleView = Backbone.View.extend(
    el: '#rule'
    template: require('../templates/rules')

    events :
        "change"                          : "onChange"
        'click #createRule'               : 'createRule'
        'click input[name="show"]'        : 'showACL'
        'click input[name="remove"]'      : 'removeRule'

    onChange : (event) ->
        event.preventDefault()
        console.log "target : ", event.target

    initialize: ->

        @listenTo @collection, 'change', @render
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
            console.log 'model : ', JSON.stringify model

            if model.get('filterDoc') != null
                filterDoc = model.get('filterDoc').rule
                filterSub = model.get('filterUser').rule
                docIDs = model.get('docIDs')
                rules.push {id: id, fDoc: filterDoc, fSub: filterSub, docIDs: docIDs}


        console.log 'rules : ', JSON.stringify(rules)

        # render the template

        @$el.html @template({rules: rules})

        return

    showACL: (event) ->
        event.preventDefault()
        id = $(event.currentTarget).data("id")
        status =  $('#'+id).css('display')
        if status is 'none'
            $('#'+id).css('display', 'block')
        else
            $('#'+id).css('display', 'none')

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

        docTypeSubPred = 'doc.docType === "contacts"'
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
        console.log 'create rule : ', JSON.stringify rule
        console.log 'rule exist? : ', rule.isNew()
        console.log 'rule id : ', rule.id
        console.log 'rule id : ', rule.get('id')
        rule.save()
        ###
        rule.save(wait: true)
        .success(data) ->
            console.log('data : ', data)
        .error(err) ->
            console.log('err : ', err)
        ###
        @collection.add rule

    removeRule: (event) ->
        event.preventDefault()
        id = $(event.currentTarget).data("id")
        console.log 'id : ', id
        rule = @collection.get(id)

        # Destroy the model: sends delete to the server
        rule.destroy()
        # Destroy from the colleciton: update the render
        @collection.remove rule
)
