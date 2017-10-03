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

        _this = @
        rule = @model.toJSON()
        domain = window.location.origin

        # Remove the null ACL
        rule.docIDs.forEach (acl) ->
            if acl is null
                rule.docIDs.splice(rule.docIDs.indexOf(acl), 1)
        rule.userIDs.forEach (acl) ->
            if acl is null
                rule.userIDs.splice(rule.userIDs.indexOf(acl), 1)

        # TODO: DEMO ONLY
        ###
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
        ###

        @$el.html @template({rule: rule, domain: domain})

        # Store the unresolved files and contacts to be later evaluated
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
                    $("td."+docid+" a").attr('href', href)
                    $("td."+docid+" p").text(filename)

                    #_this.setACLColor(acl)


                    if status is "*"
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
                    $("td."+userid+" p").text("#{fn}")

                    #_this.setACLColor(acl)

                    if status is "*"
                        c = contact.toJSON()
                        c.acl = acl
                        contacts.push c

                error: (err) ->
                    #$("#"+userid).remove()
                    #_this.$el.find('[data-idACLUser='+userid+']').remove()
                    #console.log ('remove tr line sub')
                    errors.push {id: userid, type: 'user'}

            })

        # Remove acl with errors
        errors.forEach (error) ->
            if error.type is "doc"
                console.log ('remove tr line doc')
                _this.$el.find('[data-idACLDoc='+error.id+']').remove()
            else if error.type is "user"
                _this.$el.find('[data-idACLUser='+error.id+']').remove()
                console.log ('remove tr line sub')


        # Run triggers and advisor to find suspect ACL on unresolved ones
        @resolve(contacts, files)
        @renderAllColorStatus(rule)


    renderAllColorStatus: (rule) ->
        _this = @
        rule.docIDs.forEach (aclDoc) ->
            rule.userIDs.forEach (aclUser) ->
                console.log 'acl Doc : ' + JSON.stringify aclDoc
                id = aclDoc.id + aclUser.id
                line = $("#"+id)

                cssStatus = _this.getCssStatus(aclDoc.status, aclUser.status)
                console.log ('css status : ' + cssStatus)
                line.attr("class", cssStatus)


    # Reject > Suspect > Accept > Star
    getCssStatus: (status1, status2) ->
        if status1 is "-" and status2 is "-"
            return "danger"
        else if status1 is "?" or status2 is "?"
            return "warning"
        else if status1 is "+"
            return "success"
        else
            return "success"

    # Attribute ACL color accordingly to their status
    setACLColor: (acl) ->
        console.log 'set acl color : ' + JSON.stringify acl
        id = acl.id
        if acl.status is '-'
            $("#"+id).attr('class', 'danger')
        else if acl.status is '?'
            $("#"+id).attr('class', 'warning')
        else if acl.status is '+'
            $("#"+id).attr('class', 'success')

        # TODO: FOR DEMO ONLY!!
        ###
        # bruno
        if id is "0a127ad5493b54992ea501a80f0565a6"
            @$el.find('[data-idACLUser='+id+']').attr('class', 'warning')
            return
        # bredoche
        if id is "96d4a96428a3859b6ae49b445500b332"
            @$el.find('[data-idACLUser='+id+']').attr('class', 'warning')

            return

        ###


    # Called after an ACL evaluation
    # This save the state in db
    saveACLStatus: (acl, type, status) ->
        # console.log 'acl : ', JSON.stringify acl

        # Update only if the acl status hasn't been set yet
        if acl.status is "*"
            if type is 'user'
                userIDs = @model.get 'userIDs'
                userIDs = @setACLStatus(userIDs, acl, status)
                @model.set userIDs: userIDs
                @model.save()
            else if type is 'doc'
                docIDs = @model.get 'docIDs'
                docIDs = @setACLStatus(docIDs, acl, status)
                @model.set docIDs: docIDs
                @model.save()

            ###
            else if type is 'which'
                userIDs = @model.get 'userIDs'
                docIDs = @model.get 'docIDs'
                userIDs = @setSuspectACL(userIDs, trigger, acl)
                docIDs = @setSuspectACL(docIDs, trigger, acl)
                @model.set userIDs: userIDs
                @model.set docIDs: docIDs
                @model.save()
            ###

            #@setACLColor(acl)


    setACLStatus: (list, acl, status) ->
        list.forEach (el) ->
            if el.id is acl.id
                el.status = status
        return list


    acceptACL: (event) ->
        event.preventDefault()
        # Get id of the acl and its type
        id = $(event.currentTarget).data("idacl")
        docID = $(event.currentTarget).data("iddoc")
        userID = $(event.currentTarget).data("iduser")
        console.log 'accept ' + id
        @changeACLStatus(id, docID, userID, true)

    rejectACL: (event) ->
        event.preventDefault()
        id = $(event.currentTarget).data("idacl")
        docID = $(event.currentTarget).data("iddoc")
        userID = $(event.currentTarget).data("iduser")
        console.log 'reject ' + id
        @changeACLStatus(id, docID, userID, false)


    changeACLStatus: (id, docID, userID, isAccept) ->

        docIDs = @model.get('docIDs')
        userIDs = @model.get('userIDs')
        if isAccept then status = "+" else status = "-"

        for acl in docIDs
            if acl.id is docID
                acl.status = status
                @model.save()
        for acl in userIDs
            if acl.id is userID
                acl.status = status
                @model.save()

        acl =
            id: id
            status: status
        @setACLColor(acl)



    # resolve the undetermined acls
    resolve: (users, docs) ->
        _this = @
        console.log 'triggers : ', JSON.stringify triggers
        console.log 'users : ', JSON.stringify users

        # Who triggers
        users.forEach (user) ->
            if user.acl.status is "*"
                _this.evalTriggers user, null, 'who'
        # What triggers
        docs.forEach (doc) ->
            if doc.acl.status is "*"
                _this.evalTriggers null, doc, 'what'

        ###
        # Which triggers
        users.forEach (user) ->
            if user.acl.status is "*"
                docs.forEach (doc) ->
                    if doc.acl.status is "*"
                        _this.evalTriggers user, doc, 'which'
        ###

    evalTriggers: (user, doc, triggerType) ->
        _this = @

        triggers.forEach (trigger) ->
            t = trigger.toJSON()
            if triggerType is t.type
                if t.type is 'who'
                    console.log 'eval who trigger : ' + JSON.stringify t.who
                    if _this.evalDoc(t.who, user)
                        console.log 'suspect for user ' + JSON.stringify user
                        _this.saveACLStatus(user.acl, 'user', '?')
                        return
                    _this.saveACLStatus(user.acl, 'user', '+')
                else if t.type is 'what'
                    if _this.evalDoc(t.what, doc)
                        _this.saveACLStatus(doc.acl, 'doc', '?')
                        return
                    _this.saveACLStatus(doc.acl, 'doc', '+')

                ###
                else if t.type is 'which'
                    evalWho = _this.evalDoc(t.who, user)
                    evalWhat = _this.evalDoc(t.what, doc)
                    evalOk = evalWho && evalWhat
                    if evalOk
                        _this.saveACLStatus(t, user.acl)
                        _this.saveACLStatus(t, doc.acl)
                ###


    # Each trigger consists of an att/val pair
    # If the doc has it, it is evaluated as true
    evalDoc: (triggerRule, doc) ->
        # Special case for tags, represented as array in docs
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
