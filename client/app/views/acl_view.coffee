Rule = require '../models/rule'
File = require '../models/file'
Contact = require '../models/contact'

module.exports = ACLView = Backbone.View.extend(
    el: '#acl'
    template: require('../templates/acl')

    initialize: (rule)->
        @render(rule)

    render: (rule) ->
        domain = window.location.origin
        @$el.html @template({rule: rule, domain: domain})

        # Fetch files
        rule.docIDs.forEach (docid) ->
            file = new File(id: docid)
            file.fetch({
                success: () ->
                    filename = file.get('name')
                    href = domain+"/files/"+docid+"/attach/"+filename
                    $("#"+docid+" a").attr('href', href)
                    $("#"+docid+" a").text(filename)
                error: (err) ->
                    $("#"+docid+" p").text("deleted")
            })

        # Fetch contacts
        rule.userIDs.forEach (userid) ->
            contact = new Contact(id: userid)
            contact.fetch({
                success: () ->
                    console.log 'contact : ', contact.toJSON()
                    href = domain+"/contacts/"+userid+"/picture.png"

                    fn = contact.get('fn')
                    console.log 'fn  : ', fn
                    $("#"+userid+" p").text("#{fn}")
                error: (err) ->
                    $("#"+userid+" p").text("deleted")
            })
)
