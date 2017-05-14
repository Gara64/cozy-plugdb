Rule = require '../models/rule'
File = require '../models/file'
Contact = require '../models/contact'

module.exports = ACLView = Backbone.View.extend(
    el: '#acl'
    template: require('../templates/acl')

    events :
        'click .validate'             : 'acceptACL'
        'click .cancel'               : 'rejectACL'


    initialize: ->
        @render()

    render: () ->
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

        # Fetch files
        rule.docIDs.forEach (acl) ->
            docid = acl.id
            status = acl.status
            file = new File(id: docid)
            file.fetch({
                success: () ->
                    console.log 'file : ' + JSON.stringify file
                    filename = file.get('name')
                    href = domain+"/files/"+docid+"/attach/"+filename
                    $("#"+docid+" td:first a").attr('href', href)
                    $("#"+docid+" td:first a").text(filename)

                    # Set acl status
                    _this.checkACL(acl)
                    _this.setACLVisualization(acl)

                error: (err) ->
                    $("#"+docid+" p").text("deleted")
            })

        # Fetch contacts
        rule.userIDs.forEach (acl) ->
            userid = acl.id
            status = acl.status
            contact = new Contact(id: userid)

            contact.fetch({
                success: () ->
                    console.log 'contact : ' + JSON.stringify contact
                    href = domain+"/contacts/"+userid+"/picture.png"
                    fn = contact.get('fn')
                    $("#"+userid+" td:first p").text("#{fn}")

                    # Set acl status
                    _this.checkACL(acl)
                    _this.setACLVisualization(acl)

                error: (err) ->
                    $("#"+userid+" p").text("deleted")
            })


    killView: ()->
        console.log 'harakiri!!'
        #this.remove()

    checkACL: (acl) ->
        for tag in @model.tags
            if tag == acl.id
                # Set acl to suspect is undetermined
                if acl.status is "*"
                    acl.status = "?"
                    console.log 'SENSITIVE TAG'
        # If not sensitive, it is accepted
        if acl.status is "*"
            acl.status = "+"


    setACLVisualization: (acl) ->
        id = acl.id
        # See https://bootswatch.com/cerulean/ for css themes
        if acl.status is "?"
            $("#"+id).attr('class', 'warning')
        else if acl.status is "-"
            $("#"+id).attr('class', 'danger')
        else if acl.status is "+"
            $("#"+id).attr('class', 'success')


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


)
