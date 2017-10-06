Rule = require '../models/rule'
File = require '../models/file'
Contact = require '../models/contact'
Triggers = require '../collections/triggers'
triggers = new Triggers()

module.exports = ACLView = Backbone.View.extend(
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

        @buildACLs(rule)

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
        @renderAllColorStatus()


    # Build the ACL structure, that contains all the doc/user id and their
    # current status (-,+,*,?).
    # This is a hash table, the key is the concatenation of doc/user id
    buildACLs: (rule) ->
        acls = @model.get('acls')
        userIDs = []
        docIDs = []

        ###
        Object.keys(acls).forEach (aclID) ->
            acl = acls[aclID]
            if acl.userID not in userIDs
                userIDs.push acl.userID
            if acl.docID not in docIDs
                docIDs.push acl.docID


        console.log 'userids : ' + userIDs.length
        for userID in userIDs
            console.log '{"id": "'+userID+'"},'

        console.log 'docids : ' + docIDs.length
        for docID in docIDs
            console.log '{"id": "'+docID+'"},'
        ###


        if not acls?
            console.log 'create acls object'
            acls = {}
        rule.docIDs.forEach (aclDoc) ->
            rule.userIDs.forEach (aclUser) ->
                aclID = aclDoc.id + aclUser.id
                if not acls[aclID]?
                    acl =
                        docID: aclDoc.id
                        userID: aclUser.id
                        status: '*'
                    acls[aclID] = acl

#        console.log 'acls built : ' + JSON.stringify acls

        # Save acls in db
        console.log 'acls : ' + JSON.stringify acls
        console.log 'save acls'
        console.log 'model id : ' + @model.get('id')
        @model.save()


    renderAllColorStatus: () ->
        _this = @
        acls = @model.get('acls')
        Object.keys(acls).forEach (id) ->
            acl = acls[id]
            #console.log 'acl : ' + JSON.stringify acl
            line = $("#"+id)
            if acl.status is '-'
                cssClass = "danger"
            else if acl.status is '?'
                cssClass = "warning"
            else
                cssClass = "success"

            #console.log ('css status : ' + cssClass)
            line.attr("class", cssClass)

    ###
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
    ###


    # Attribute ACL color accordingly to their status
    setACLColor: (acl) ->
        console.log 'set acl color : ' + JSON.stringify acl
        id = acl.docID + acl.userID
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
    saveACLStatus: (id, status) ->
        # console.log 'acl : ', JSON.stringify acl

        acls = @model.get('acls')
        # Iterate over all the acl to find the ones matching
        ###
        Object.keys(acls).forEach (aclID) ->
            # The ACL id is the concetantion of doc and user id
            if aclID.indexOf(id) > -1
                acl = acls[aclID]
                acl.status = status
                console.log 'acl status updated : ' + JSON.stringify acl
        ###
        acl = acls[id]
        acl.status = status
        console.log 'acl status updated : ' + JSON.stringify acl
        @model.save()


    setACLStatus: (list, acl, status) ->
        list.forEach (el) ->
            if el.id is acl.id
                el.status = status
        return list


    acceptACL: (event) ->
        event.preventDefault()
        id = $(event.currentTarget).data("idacl")
        @changeACLStatus(id, '+')


    rejectACL: (event) ->
        event.preventDefault()
        id = $(event.currentTarget).data("idacl")
        console.log 'reject ' + id
        @changeACLStatus(id, '-')


    changeACLStatus: (id, status) ->

        acls = @model.get('acls')
        modelId = @model.get('id')
        acl = acls[id]
        console.log 'acls : ' + JSON.stringify acls
        console.log 'id : ' + modelId
        acl.status = status
        console.log 'save change acl status'
        @model.save()
        @setACLColor(acl)



    # resolve the undetermined acls
    resolve: (users, docs) ->
        _this = @
        # console.log 'triggers : ', JSON.stringify triggers
        # console.log 'users : ', JSON.stringify users

        acls = @model.get('acls')

        # Iterate over all the ACL to find unresolved ACL
        Object.keys(acls).forEach (id) ->
            acl = acls[id]

            if acl.status is '*'
                # find the user and evaluate against who triggers
                users.forEach (user) ->
                    if user.id is acl.userID
                        status = _this.evalTriggers acl, user, null, 'who'
                        if status is '?'
                            _this.saveACLStatus(id, '?')
                        else
                            # find the doc and evaluate against what triggers
                            docs.forEach (doc) ->
                                if doc.id is acl.docID
                                    status = _this.evalTriggers acl, null, doc, 'what'
                                    console.log 'status after what : ' + status
                                    _this.saveACLStatus(id, status)

        ###
        # Who triggers
        users.forEach (user) ->
            if user.acl.status is "*"
                _this.evalTriggers user, null, 'who'
        # What triggers
        docs.forEach (doc) ->
            if doc.acl.status is "*"
                _this.evalTriggers null, doc, 'what'
        ###

        ###
        # Which triggers
        users.forEach (user) ->
            if user.acl.status is "*"
                docs.forEach (doc) ->
                    if doc.acl.status is "*"
                        _this.evalTriggers user, doc, 'which'
        ###


    evalTriggers: (acl, user, doc, triggerType) ->
        _this = @
        status = '+'

        triggers.forEach (trigger) ->
            t = trigger.toJSON()
            if triggerType is t.type
                if t.type is 'who'
                    if _this.evalDoc(t.who, user)
                        console.log 'suspect for user ' + JSON.stringify user
                        status = '?'
                        return
                else if t.type is 'what'
                    console.log 'eval what trigger : ' + JSON.stringify t.what
                    if _this.evalDoc(t.what, doc)
                        console.log 'suspect for doc ' + JSON.stringify doc
                        console.log 'hey I return ? !'
                        status = '?'
                        return
        # The status is '?' is it matched a trigger, '+' otherwise
        return status

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
