Plug = require('../models/plug')
Rules = require('../collections/rules')
Contacts = require('../collections/contacts')
Triggers = require('../collections/triggers')
aclView = require './acl_view'
contactView = require './contacts_view'
ruleView = require './rules_view'
triggerView = require './trigger_view'

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


    render: ->
        model = @model

        # render the template
        @$el.html @template()

        @renderStatus()
        @renderPlug()


        triggers = new Triggers()
        triggers.fetch(reset: true)
        #triggerView = new triggerView(collection: triggers)

        rules = new Rules()
        rules.fetch(reset:true)
        ruleView = new ruleView(collection: rules)

        contacts = new Contacts()
        contacts.fetch(reset:true)
        contactView = new contactView(collection: contacts)

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
        ###
        TODO: COMMENT ONLY FOR DEV
        if(isAuth)
            $('#myList').css('display', 'block')
            @render
        else
            $('#myList').css('display', 'none')
        ###
        $('#myList').css('display', 'block')
        @render
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
        
        @$el.find('#authStatus').attr('style', 'display:block')

        #plug.set status: 'Authentication...'
        plug.authenticateFP (res, authenticated) ->
            _this.$el.find('#authStatus').attr('style', 'display:none')
            #plug.set auth: authenticated
            #check if the authentication failed but not the initialization
            if(not authenticated)
                console.log 'not auth !'
                #_this.getPlugStatus()
            else
                console.log 'auth !'
                _this.$el.find('#auth').attr('style', 'display:block')
                #plug.set init: true

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
