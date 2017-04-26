Plug = require('../models/plug')
Rule = require ('../models/rule')
Rules = require ('../collections/rules')
rule = new Rule()
rules = new Rules()
aclView = require './acl_view'
ruleView = require './rules_view'

#var Device = require('../models/device');
module.exports = AppView = Backbone.View.extend(
    el: 'body'
    template: require('../templates/home')
    events:
        'click #registerDevice'    : 'registerDevice'
        'click #insertDocs'        : 'createDocs'
        'click #replicateContacts' : 'replicate'
        'click #replicatePhotos'   : 'replicate'
        'click #cancel'            : 'cancelReplications'
        'click #authenticate'      : 'authenticateFP'
        'click #init'              : 'initPlug'
        'click #close'             : 'closePlug'
        'click #reset'             : 'resetPlug'
        'click #insertSingleDoc'   : 'insertSingleDoc'
        'click #createRule'        : 'createRule'


    render: ->
        model = @model

        # render the template
        @$el.html @template()

        @renderStatus()
        @renderPlug()

        myCollection = new ContactCollection()
        myCollection.fetch(reset:true)

        realtimer = new ContactListener()
        realtimer.watch myCollection

        # en supposant qu'il y ait un element d'id myList dans le html
        view = new ContactListView
           el         : '#myList'
           collection : myCollection

        #srCollection  = new SharingRuleCollection()
        rules.fetch(reset:true)
        ruleView = new ruleView(collection: rules)

        this

    renderStatus: ->
        model = @model
        @$el.html @template(status: model.get('status'))


    renderPlug: ->
        model = @model
        isInit = model.get('init')
        console.log 'is init : ' + isInit
        $('#plugBlock').css('border-color', if isInit then 'green' else 'red')

        isAuth = model.get('auth')
        if(isAuth)
            $('#myList').css('display', 'block')
            @render
        else
            $('#myList').css('display', 'none')

        this

    updateStatus: ->
        #this.$el.find('')
        return

    getPlugStatus: (callback) ->
        plug = @model
        plug.status (res) ->
            console.log 'init : ' + res.init
            console.log 'auth : ' + res.auth
            plug.set init: res.init
            plug.set auth: res.auth
            callback
        return

    replicate: (event) ->
        event.preventDefault()
        plug = @model
        dataType = $(event.currentTarget).data('datatype')
        target = @$el.find('input[name="targetURL"]').val()
        if target is ''
            alert 'Please type the target URL'
            return
        if not plug.get 'auth'
            alert 'Please authenticate first'
            return

        plug.set dataType: dataType
        plug.set target: target
        plug.replicate (res) ->
            plug.set status: res
            return
        return

    cancelReplications: (event) ->
        event.preventDefault()
        plug = @model
        plug.cancelReplications (res) ->
            plug.set status: res
            return
        return

    registerDevice: (event) ->
        event.preventDefault()
        plug = @model
        plug.set target: @$el.find('input[name="targetURL"]').val()
        plug.register (res) ->
            plug.set status: res
            return
        return

    createDocs: (event) ->
        event.preventDefault()
        plug = @model
        plug.set nDocs   : @$el.find('input[name="nDocs"]').val()
        plug.set baseName: @$el.find('input[name="baseName"]').val()
        plug.set status: 'Generation of the documents...'
        plug.generate (res) ->
            plug.set status: res
            return
        return

    initPlug: (event) ->
        event.preventDefault()
        plug = @model
        plug.set status: 'Initialization...'
        plug.init (res, init) ->
            plug.set status: res
            plug.set init: init
            return
        return

    closePlug: (event) ->
        event.preventDefault()
        plug = @model
        plug.set status: 'Shut down...'
        plug.close (res, closed) ->
            plug.set status: res
            plug.set auth: !closed
            plug.set init: !closed
            return
        return

    resetPlug: (event) ->
        event.preventDefault()
        plug = @model
        plug.set status: 'Restart plugDB...'
        plug.reset (res, reset) ->
            plug.set status: res
            plug.set auth: !reset
            plug.set init: reset
            return
        return

    authenticateFP: (event) ->
        event.preventDefault()
        _this = this
        plug = @model
        plug.set status: 'Authentication...'
        plug.authenticateFP (res, authenticated) ->
            plug.set status: res
            plug.set auth: authenticated
            #check if the authentication failed but not the initialization
            if(not authenticated)
                _this.getPlugStatus()
            else
                plug.set init: true
            return
        return

    insertSingleDoc: (event) ->
        event.preventDefault()
        _this = this
        plug = @model
        plug.set baseName: @$el.find('input[name="singleBaseName"]').val()
        plug.set status: 'Insertion of a new contact...'
        plug.insert (res) ->
            plug.set status: res
            return
        return

    createRule: (event) ->
        event.preventDefault()
        rule.set docType   : @$el.find('input[name="doctype"]').val()
        rule.set docAttr: @$el.find('input[name="docattr"]').val()
        rule.set docVal: @$el.find('input[name="docval"]').val()
        rule.set subAttr: @$el.find('input[name="subattr"]').val()
        rule.set subVal: @$el.find('input[name="subval"]').val()
        rule.create (res) ->
            console.log 'res : ', res


    # initialize is automatically called once after the view is constructed
    initialize: ->
        _this = this

        @getPlugStatus () ->
            _this.renderPlug _this
        #@renderPlug this
        @model.on 'change:status', @render, this
        @model.on 'change:auth', @render, this
        @model.on 'change:init', @render, this
        return

    onInsertPlug: (model) ->
        # re-render the view
        @render()
        return
)



class Contact extends Backbone.Model


class ContactCollection extends Backbone.Collection
    model : Contact
    url   : 'contacts'


class ContactListener extends CozySocketListener
    models:
        'contact': Contact
    events: [
        'contact.create'
        'contact.update'
        'contact.delete'
    ]
    onRemoteCreate: (model) ->
        @collection.add model
    onRemoteDelete: (model) ->
        @collection.remove model


class ContactListView extends Backbone.View

    events :
        "change" : "onChange"


    onChange : (e) ->
        console.log 'target : ', e.target
        e.preventDefault()
        if e.target.type == "checkbox"
            model = @collection.get(e.target.id)
            model.save({shared : !model.get('shared')}, {wait:true})
        else
            @handleInputChange(e.target)


    handleInputChange : (elt)->
        console.log "handleInputChange !"
        parent = elt.parentElement.parentElement
        firstName = parent.children[0].children[0].value
        lastName  = parent.children[1].children[0].value
        note      = parent.children[2].children[0].value
        data =
            n    : lastName + ";" + firstName + ";;;"
            fn   : firstName + " " + lastName
            note : note
        model = @collection.get(parent.id)
        model.save(data, {wait:true})


    initialize: ->
        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render

        # @el.addEventListener('blur',@onBlur)

    renderOne: (model) =>
        #console.log  model.get('shared')
        checked = if model.get('shared') then "checked='checked'" else ''
        n = model.get('n')
        if n
            n = n.split(';')
        else
            n = [model.get('fn'),'']
        #console.log n
        id = model.get('id')
        """
            <tr class='contac-row' id=#{id}>
               <!-- <td role="id">#{id}</td> -->
                <td role="fn"><input value="#{n[1]}"></input></td>
                <td role="ln"><input value="#{n[0]}"></input></td>
                <td role="pn"><input value="#{model.get('note')}"></input></td>
                <td><input type="checkbox" id="#{id}" #{checked}></td>
            </tr>
        """

    render: =>
        html =
        """
            <table>
            <thead>
            <tr class="titles">
               <!-- <td>ID</td> -->
                <td role="ln">Last name</td>
                <td role="fn">First name</td>
                <td role="pn">Note</td>
                <td>Shared</td>
            </tr>
            </thead>
        """
        @collection.forEach (model) =>
            html += @renderOne model

        html += '</table>'
        @$el.html(html)
