Rule = require '../models/rule'
Rules = require '../collections/rules'
ACLView = require './acl_view'
Tags = require '../collections/tags'

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

curACLView = null

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

        @collection.getSensitiveTags (err, tags) ->
            console.log 'tags : ' + JSON.stringify tags


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


        console.log 'rules : ', JSON.stringify(rules)

        # render the template
        @$el.html @template({rules: rules})

        return

    showACL: (event) ->
        event.preventDefault()
        id = $(event.currentTarget).data("id")
        rule = @collection.get(id)
        #console.log 'status : ', $(event.currentTarget).data("status")
        status = $(event.currentTarget).data("status")

        aclView = new ACLView({model: rule})

        console.log 'status : ',rule.aclStatus
        console.log 'id : ',rule.id

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
