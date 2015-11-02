Plug = require('../models/plug')
SharingRuleView = require './sharingRuleView'
AddSharingRuleView = require './addSharingRuleView'

module.exports = AppView = Backbone.View.extend
    el: 'body'

    template: require('../templates/home')
    events:
        'click #registerDevice'    : 'registerDevice'
        'click #insertDocs'        : 'createDocs'
        'click #replicateContacts' : 'replicate'
        'click #replicatePhotos'   : 'replicate'
        'click #authenticate'      : 'authenticateFP'
        'click #init'              : 'initPlug'
        'click #close'             : 'closePlug'
        'click #reset'             : 'resetPlug'
        'click #addRule'           : 'addRule'


    render: ->
        # render the template
        @$el.html @template()

        @collection.fetch();
        @collection.forEach (sharingRule) ->
            @onRuleAdded sharingRule

    onRuleAdded: (sharingRule) ->
        ruleView = new SharingRuleView model: sharingRule
        ruleView.render()

        #append the view on the 1st ul element in the el childs (body)
        @$el.find('ul').append ruleView.$el

        console.log 'new rule added'

        #@renderStatus()
        #@renderPlug()

        #myCollection = new ContactCollection()
        #myCollection.fetch(reset:true)

        #realtimer = new ContactListener()
        #realtimer.watch myCollection

        # en supposant qu'il y ait un element d'id myList dans le html
        #view = new ContactListView
        #   el         : '#myList'
        #   collection : myCollection

        this


    addRule: ->
        addRuleView = new AddSharingRuleView()
        addRuleView.render()

        @$('#createRule').empty() #In case there is already a form
        @$('#createRule').append addRuleView.$el


    renderStatus: ->
        #model = @model
        #@$el.html @template(status: model.get('status'))


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
        $('#status').html 'Authentification...'

        $.ajax
            url: 'plug/authenticate',
            type: 'POST',
            success: (result) =>
                console.log 'auth ok'
                $('#status').html 'Authentification successful'
                @render()
            error: (result, response) ->
                console.log 'auth nok : ' + JSON.stringify result
                $('#status').html 'Authentification failed'

        #plug.set status: 'Authentication...'
        ###plug.authenticateFP (res, authenticated) ->
            plug.set status: res
            plug.set auth: authenticated
            #check if the authenticaion failed but not the initialization
            if not authenticated
                _this.getPlugStatus()
            else
                plug.set init: true
            return
        return
        ###





    # initialize is automatically called once after the view is constructed
    initialize: ->
        _this = this
        @listenTo(@collection, "add", @onRuleAdded)

        #@getPlugStatus () ->
        #    _this.renderPlug _this
        #@renderPlug this
        #@model.on 'change:status', @render, this
        #@model.on 'change:auth', @render, this
        #@model.on 'change:init', @render, this
        return

    onInsertPlug: (model) ->
        # re-render the view
        @render()
        return




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
        console.log e.target
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
        #@listenTo @collection, 'change', @render
        #@listenTo @collection, 'add'   , @render
        #@listenTo @collection, 'remove', @render
        #@listenTo @collection, 'reset' , @render
        #console.log @el
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
