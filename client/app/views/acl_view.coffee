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
        @$el.html @template({rule: rule, domain: domain})
        _this = @

        # Store the files and contacts to be later evaluated on triggers
        files = []
        contacts = []

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
                    $("#"+docid+" td:first a").attr('href', href)
                    $("#"+docid+" td:first a").text(filename)

                    _this.setACLVisualization(acl)

                    f = file.toJSON()
                    f.acl = acl
                    files.push f

                error: (err) ->
                    $("#"+docid).remove()
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
                    $("#"+userid+" td:first p").text("#{fn}")

                    _this.setACLVisualization(acl)

                    c = contact.toJSON()
                    c.acl = acl
                    contacts.push c

                error: (err) ->
                    $("#"+userid).remove()
            })

        # Check triggers
        @resolve(contacts, files)


    setACLVisualization: (acl) ->
        id = acl.id
        # See https://bootswatch.com/cerulean/ for css themes
        if acl.status is "?"
            $("#"+id).attr('class', 'warning')
        else if acl.status is "-"
            $("#"+id).attr('class', 'danger')
        else if acl.status is "+" || acl.status is "*"
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
        id = $(event.currentTarget).data("id")
        type = $(event.currentTarget).data("type")
        console.log 'accept ' + id
        @changeACLStatus(id, type, true)

    rejectACL: (event) ->
        event.preventDefault()
        # Get id of the acl and its type
        id = $(event.currentTarget).data("id")
        type = $(event.currentTarget).data("type")
        console.log 'reject ' + id
        @changeACLStatus(id, type, false)


    changeACLStatus: (id, type, isAccept) ->
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
                if doc[triggerRule.att] is triggerRule.val
                    evalOk = true
                    return
        return evalOk



)
