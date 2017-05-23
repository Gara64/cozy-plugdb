Rule = require '../models/rule'
File = require '../models/file'
Contact = require '../models/contact'
Triggers = require '../collections/triggers'
triggers = new Triggers()

module.exports = ACLView = Backbone.View.extend(
    el: '#acl'
    template: require('../templates/acl')

    events :
        'click .validate'             : 'acceptACL'
        'click .cancel'               : 'rejectACL'

    initialize: ->
        @listenTo triggers, 'add'   , @render
        @listenTo triggers, 'remove', @render
        @listenTo triggers, 'reset' , @render

        triggers.fetch(reset: true)

    render: () ->
        console.log 'render trigger model', JSON.stringify @model
        rule = @model.toJSON()
        domain = window.location.origin
        rule.docIDs.forEach (acl) ->
            if acl is null
                rule.docIDs.splice(rule.docIDs.indexOf(acl), 1)
        rule.userIDs.forEach (acl) ->
            if acl is null
                rule.userIDs.splice(rule.userIDs.indexOf(acl), 1)

        # TODO: DEMO ONLY
        if rule.id is "0a127ad5493b54992ea501a80f054972"
            console.log 'holidays rule'
            rule.docIDs = [{id: "96d4a96428a3859b6ae49b4455007b1f"}, {id:"96d4a96428a3859b6ae49b445500fc40"}]
            rule.userIDs = [
                {id: "96d4a96428a3859b6ae49b445500b332"},
                {id: "96d4a96428a3859b6ae49b445500c449"},
                {id: "96d4a96428a3859b6ae49b445500d6c0"},
                {id: "96d4a96428a3859b6ae49b445501a04f"},
                {id: "96d4a96428a3859b6ae49b445501b104"},
                {id: "96d4a96428a3859b6ae49b445501dddf"},
                {id: "96d4a96428a3859b6ae49b445501edcc"}
            ]


        @$el.html @template({rule: rule, domain: domain})
        _this = @

        # Store the files and contacts to be later evaluated on triggers
        files = []
        contacts = []

        errors = []


        # Fetch files
        rule.docIDs.forEach (acl) ->
            docid = acl.id
            status = acl.status
            file = new File(id: docid)
            file.fetch({
                async: false,
                success: () ->
                    filename = file.get('name')
                    href = domain+"/files/"+docid+"/attach/"+filename
                    #$("."+docid+" td:first a").attr('href', href)
                    #$("."+docid+" td:first p").text(filename)
                    $("."+docid+" a").attr('href', href)
                    $("."+docid+" p").text(filename)

                    _this.setACLVisualization(acl)

                    f = file.toJSON()
                    f.acl = acl
                    files.push f

                error: (err) ->
                    #$("#"+docid).remove()
                    errors.push {id: docid, type: 'doc'}
                    #_this.$el.find('[data-idACLDoc='+docid+']').remove()
                    #console.log ('remove tr line doc')

            })

        # Fetch contacts
        rule.userIDs.forEach (acl) ->
            userid = acl.id
            status = acl.status
            contact = new Contact(id: userid)

            contact.fetch({
                async: false,
                success: () ->
                    href = domain+"/contacts/"+userid+"/picture.png"
                    fn = contact.get('fn')
                    $("."+userid+" p").text("#{fn}")

                    _this.setACLVisualization(acl)

                    c = contact.toJSON()
                    c.acl = acl
                    contacts.push c

                error: (err) ->
                    #$("#"+userid).remove()
                    #_this.$el.find('[data-idACLUser='+userid+']').remove()
                    #console.log ('remove tr line sub')
                    errors.push {id: userid, type: 'user'}

            })

        errors.forEach (error) ->
            if error.type is "doc"
                console.log ('remove tr line doc')
                _this.$el.find('[data-idACLDoc='+error.id+']').remove()
            else if error.type is "user"
                _this.$el.find('[data-idACLUser='+error.id+']').remove()
                console.log ('remove tr line sub')


        # Check triggers
        @resolve(contacts, files)



    setACLVisualization: (acl) ->
        id = acl.id
        console.log "acl id : " + id
        # TODO: FOR DEMO ONLY!!
        # bruno
        if id is "0a127ad5493b54992ea501a80f0565a6"
            @$el.find('[data-idACLUser='+id+']').attr('class', 'warning')
            return
        # bredoche
        if id is "96d4a96428a3859b6ae49b445500b332"
            @$el.find('[data-idACLUser='+id+']').attr('class', 'warning')

            return

        # See https://bootswatch.com/cerulean/ for css themes
        if acl.status is "?"
            $("#"+id).attr('class', 'warning')
            #$("#"+id).css("color", "orange")
        else if acl.status is "-"
            #$("#"+id).css("color", "red")
            $("#"+id).attr('class', 'danger')
        else if acl.status is "+" || acl.status is "*"
            #$("#"+id).css("color", "green")
            $("#"+id).attr('class', 'success')


    setACLSuspect: (trigger, acl) ->
        # Update only if the acl status hasn't been set yet
        # TODO: don't forget to uncomment this
        console.log 'acl : ', JSON.stringify acl
        if acl.status is "*"

            if trigger.type is 'who'
                userIDs = @model.get 'userIDs'
                console.log 'user ids : ' + JSON.stringify userIDs
                userIDs = @setACL(userIDs, trigger, acl)
                @model.set userIDs: userIDs
                #console.log 'updated model : ', JSON.stringify @model
                @model.save()

            else if trigger.type is 'what'
                docIDs = @model.get 'docIDs'
                docIDs = @setACL(docIDs, trigger, acl)
                @model.set docIDs: docIDs
                @model.save()
            else if trigger.type is 'which'
                userIDs = @model.get 'userIDs'
                docIDs = @model.get 'docIDs'
                userIDs = @setACL(userIDs, trigger, acl)
                docIDs = @setACL(docIDs, trigger, acl)
                @model.set userIDs: userIDs
                @model.set docIDs: docIDs
                @model.save()

            @setACLVisualization(acl)


    setACL: (list, trigger, acl) ->
        list.forEach (el) ->
            if el.id is acl.id
                el.status = '?'
                el.trigger = trigger
        return list


    acceptACL: (event) ->
        event.preventDefault()
        # Get id of the acl and its type
        id = $(event.currentTarget).data("idacl")
        type = $(event.currentTarget).data("type")
        console.log 'accept ' + id
        @changeACLStatus(id, type, true)

    rejectACL: (event) ->
        event.preventDefault()
        # Get id of the acl and its type
        id = $(event.currentTarget).data("idacl")
        type = $(event.currentTarget).data("type")
        console.log 'reject ' + id
        @changeACLStatus(id, type, false)


    changeACLStatus: (id, type, isAccept) ->
        ###
        if type is "doc"
            docIDs = @model.get('docIDs')
            for acl in docIDs
                if acl.id is id
                    if isAccept then acl.status = "+"  else acl.status = "-"
                    @model.save()
                    @setACLVisualization(acl)
        if type is "user"
            userIDs = @model.get('userIDs')
            for acl in userIDs
                if acl.id is id
                    if isAccept then acl.status = "+"  else acl.status = "-"
                    @model.save()
                    @setACLVisualization(acl)
        ###

        #id = $(event.currentTarget).data("idacl")
        #id = id.split(":")[0]
        #$("#"+id).attr('class', 'danger')
        if isAccept
            $("#"+id).attr('class', 'success')
        else
            $("#"+id).attr('class', 'danger')
        return

    # resolve the undetermined acls
    resolve: (users, docs) ->
        _this = @
        console.log 'triggers : ', JSON.stringify triggers
        users.forEach (user) ->
            if user.status is "*"
                _this.evalTriggers user, null, 'who'
        docs.forEach (doc) ->
            if doc.status is "*"
                _this.evalTriggers null, doc, 'what'

        users.forEach (user) ->
            if user.status is "*"
                docs.forEach (doc) ->
                    if doc.status is "*"
                        _this.evalTriggers user, doc, 'which'

    evalTriggers: (user, doc, triggerType) ->
        _this = @
        triggers.forEach (trigger) ->
            t = trigger.toJSON()
            if triggerType is t.type

                if t.type is 'who'
                    if _this.evalDoc(t.who, user)
                        _this.setACLSuspect(t, user.acl)
                else if t.type is 'what'
                    if _this.evalDoc(t.what, doc)
                        _this.setACLSuspect(t, doc.acl)
                else if t.type is 'which'
                    evalWho = _this.evalDoc(t.who, user)
                    evalWhat = _this.evalDoc(t.what, doc)
                    evalOk = evalWho && evalWhat
                    if evalOk
                        _this.setACLSuspect(t, user.acl)
                        _this.setACLSuspect(t, doc.acl)


    evalDoc: (triggerRule, doc) ->
        if triggerRule.att is "tag" && doc.tags.length > 0
            if triggerRule.val in doc.tags
                return true
        else
            if doc[triggerRule.att] is triggerRule.val
                return true
        return false


    evalDocs: (docs, triggerRule) ->
        evalOk = false
        docs.forEach (doc) ->
            # Special case for tags array
            if triggerRule.att is "tag" && doc.tags.length > 0
                if triggerRule.val in doc.tags
                    evalOk = true
                    return
            else
                if doc[triggerRule.att].indexOf(triggerRule.val) > -1
                    evalOk = true
                    return
        return evalOk



)
