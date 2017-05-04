Rule = require '../models/rule'
File = require '../models/file'
Contact = require '../models/contact'

module.exports = ACLView = Backbone.View.extend(
    el: '#acl'
    template: require('../templates/acl')

    initialize: ->
        console.log 'model : ', @model.get('id')
        @listenTo @model, 'change', @killView
        @model.on "change:aclStatus", @killView
        @render()

    render: () ->
        rule = @model.toJSON()
        domain = window.location.origin
        @$el.html @template({rule: rule, domain: domain})
        _this = @

        # Fetch files
        rule.docIDs.forEach (docid) ->

            file = new File(id: docid)
            file.fetch({
                success: () ->
                    filename = file.get('name')
                    href = domain+"/files/"+docid+"/attach/"+filename
                    $("#"+docid+" a").attr('href', href)
                    $("#"+docid+" a").text(filename)
                    sensitive = _this.checkTags(docid)
                    if sensitive is true
                        console.log 'TRUE DAT'
                        $("#"+docid).attr('class', 'acl_suspect')
                    else
                        $("#"+docid).attr('class', 'acl_accept')


                error: (err) ->
                    $("#"+docid+" p").text("deleted")
            })

        # Fetch contacts
        rule.userIDs.forEach (userid) ->
            contact = new Contact(id: userid)

            contact.fetch({
                success: () ->
                    href = domain+"/contacts/"+userid+"/picture.png"
                    fn = contact.get('fn')
                    $("#"+userid+" p").text("#{fn}")

                    sensitive = _this.checkTags(userid)
                    if sensitive is true
                        $("#"+userid).attr('class', 'acl_suspect')
                    else
                        $("#"+userid).attr('class', 'acl_accept')
                error: (err) ->
                    $("#"+userid+" p").text("deleted")
            })


    killView: ()->
        console.log 'harakiri!!'
        #this.remove()

    checkTags: (docid) ->
        for tag in @model.tags
            if tag == docid
                console.log 'SENSITIVE TAG'
                return true

        return false

)
